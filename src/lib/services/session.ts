import { prisma } from '@/lib/prisma';
import { SessionStatus, ChallengeType } from '@prisma/client';
import { getTodayDateString } from './assignment';

export interface SubmitAnswerParams {
  sessionId: string;
  userId: string;
  answerPayload: any;
}

export class ChallengeSessionService {
  /**
   * Start a 30-second server-authoritative challenge session.
   */
  static async startSession(assignmentId: string, userId: string) {
    const assignment = await prisma.challengeAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        session: true,
        challenge: true,
      },
    });

    if (!assignment) {
      throw new Error('Assignment not found.');
    }

    if (assignment.userId !== userId) {
      throw new Error('Unauthorized access to assignment.');
    }

    if (assignment.session) {
      // If session exists, verify expiration status before returning
      const now = Date.now();
      if (
        assignment.session.status === SessionStatus.ACTIVE &&
        now >= assignment.session.expiresAt.getTime() + 1000
      ) {
        // Mark as EXPIRED
        return await prisma.challengeSession.update({
          where: { id: assignment.session.id },
          data: { status: SessionStatus.EXPIRED },
          include: { submission: true },
        });
      }
      return assignment.session;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 1000); // Strict 30 seconds

    const newSession = await prisma.challengeSession.create({
      data: {
        assignmentId,
        userId,
        startedAt: now,
        expiresAt,
        status: SessionStatus.ACTIVE,
      },
      include: {
        assignment: {
          include: { challenge: true },
        },
      },
    });

    return newSession;
  }

  /**
   * Check and synchronize session status server-side.
   */
  static async getSessionStatus(sessionId: string, userId: string) {
    const session = await prisma.challengeSession.findUnique({
      where: { id: sessionId },
      include: {
        assignment: {
          include: { challenge: true },
        },
        submission: true,
      },
    });

    if (!session || session.userId !== userId) {
      return null;
    }

    const now = Date.now();
    const isExpired = now >= session.expiresAt.getTime() + 1000;

    if (session.status === SessionStatus.ACTIVE && isExpired) {
      // Transition to EXPIRED
      const updated = await prisma.$transaction(async (tx) => {
        const s = await tx.challengeSession.update({
          where: { id: sessionId },
          data: { status: SessionStatus.EXPIRED },
          include: { submission: true },
        });

        if (!s.submission) {
          await tx.submission.create({
            data: {
              sessionId,
              userId,
              answerPayload: { timeout: true },
              isCorrect: false,
              xpEarned: 0,
            },
          });
          // Reset current streak on timeout
          const stats = await tx.userStats.findUnique({ where: { userId } });
          if (stats) {
            await tx.userStats.update({
              where: { userId },
              data: { currentStreak: 0 },
            });
          }
        }
        return s;
      });
      return updated;
    }

    return session;
  }

  /**
   * Submit challenge answer with strict server-side authorization,
   * 30-second timestamp check, and double-submission prevention.
   */
  static async submitAnswer({ sessionId, userId, answerPayload }: SubmitAnswerParams) {
    return await prisma.$transaction(async (tx) => {
      const session = await tx.challengeSession.findUnique({
        where: { id: sessionId },
        include: {
          assignment: {
            include: { challenge: true },
          },
          submission: true,
        },
      });

      if (!session || session.userId !== userId) {
        return { success: false, error: 'Unauthorized or session not found.' };
      }

      // Check double submission
      if (session.status !== SessionStatus.ACTIVE || session.submission) {
        return {
          success: false,
          error: 'Challenge session is already completed or expired.',
        };
      }

      const now = Date.now();
      // Strict 30-second server deadline + 1.5s network buffer
      const isExpired = now > session.expiresAt.getTime() + 1500;

      if (isExpired) {
        await tx.challengeSession.update({
          where: { id: sessionId },
          data: { status: SessionStatus.EXPIRED },
        });

        await tx.submission.create({
          data: {
            sessionId,
            userId,
            answerPayload: answerPayload || { late: true },
            isCorrect: false,
            xpEarned: 0,
          },
        });

        // Reset user streak
        const stats = await tx.userStats.findUnique({ where: { userId } });
        if (stats) {
          await tx.userStats.update({
            where: { userId },
            data: { currentStreak: 0 },
          });
        }

        return {
          success: false,
          status: SessionStatus.EXPIRED,
          message: "Time's up! The 30-second challenge window has expired.",
          xpEarned: 0,
        };
      }

      // Evaluate answer correctness against challenge payload
      const challenge = session.assignment.challenge;
      const payload: any = challenge.payload;
      let isCorrect = false;

      if (challenge.type === ChallengeType.QUIZ) {
        const userAnswer = String(answerPayload?.answer || '').trim();
        const expected = String(payload.correctAnswer || '').trim();
        isCorrect = userAnswer.toLowerCase() === expected.toLowerCase();
      } else if (challenge.type === ChallengeType.TEXT) {
        const userText = String(answerPayload?.text || '').trim();
        if (payload.mode === 'EXACT') {
          const target = String(payload.targetText || '').trim();
          isCorrect = userText.toLowerCase() === target.toLowerCase();
        } else if (payload.mode === 'KEYWORDS') {
          const reqKeywords: string[] = payload.requiredKeywords || [];
          const found = reqKeywords.filter((kw) =>
            userText.toLowerCase().includes(kw.toLowerCase())
          );
          isCorrect = found.length >= (payload.minCount || reqKeywords.length);
        } else if (payload.mode === 'LIST_CHECK') {
          const userItems = userText
            .toLowerCase()
            .split(/[,;\n]+/)
            .map((s) => s.trim())
            .filter(Boolean);
          const allowed: string[] = payload.allowedAnswers || [];
          const matched = new Set<string>();
          for (const item of userItems) {
            if (allowed.some((a) => a.toLowerCase() === item)) {
              matched.add(item);
            }
          }
          isCorrect = matched.size >= (payload.minCount || 3);
        }
      } else if (challenge.type === ChallengeType.ACTION) {
        const actionType = payload.actionType;
        if (actionType === 'CLICK_TARGET') {
          const count = Number(answerPayload?.clickCount || 0);
          isCorrect = count >= (payload.targetCount || 10);
        } else if (actionType === 'ORDER_CLICK') {
          const userOrder: number[] = answerPayload?.clicks || [];
          const expected: number[] = payload.expectedOrder || [];
          isCorrect =
            userOrder.length === expected.length &&
            userOrder.every((val, idx) => val === expected[idx]);
        } else if (actionType === 'MATH_SOLVER') {
          const val = Number(answerPayload?.answer);
          isCorrect = val === Number(payload.correctAnswer);
        } else if (actionType === 'SLIDER_TARGET') {
          const val = Number(answerPayload?.value);
          const target = Number(payload.targetValue);
          const tol = Number(payload.tolerance || 2);
          isCorrect = Math.abs(val - target) <= tol;
        } else if (actionType === 'WORD_UNSCRAMBLE') {
          const word = String(answerPayload?.word || '').trim();
          isCorrect = word.toUpperCase() === String(payload.correctWord || '').toUpperCase();
        }
      }

      const xpEarned = isCorrect ? challenge.baseXp : 0;

      // Update session status to COMPLETED
      await tx.challengeSession.update({
        where: { id: sessionId },
        data: { status: SessionStatus.COMPLETED },
      });

      // Save submission
      const submission = await tx.submission.create({
        data: {
          sessionId,
          userId,
          answerPayload: answerPayload || {},
          isCorrect,
          xpEarned,
        },
      });

      // Update user stats and streak
      const todayStr = getTodayDateString();
      const userStats = await tx.userStats.findUnique({ where: { userId } });

      if (userStats) {
        if (isCorrect) {
          const newStreak = (userStats.currentStreak || 0) + 1;
          const bestStreak = Math.max(userStats.bestStreak || 0, newStreak);
          await tx.userStats.update({
            where: { userId },
            data: {
              totalXp: userStats.totalXp + xpEarned,
              currentStreak: newStreak,
              bestStreak,
              lastCompletedDate: todayStr,
            },
          });
        } else {
          await tx.userStats.update({
            where: { userId },
            data: {
              currentStreak: 0,
            },
          });
        }
      }

      return {
        success: true,
        status: SessionStatus.COMPLETED,
        isCorrect,
        xpEarned,
        submission,
      };
    });
  }
}

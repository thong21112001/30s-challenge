import { prisma } from '@/lib/prisma';
import { ChallengeAssignment, Challenge, ChallengeSession } from '@prisma/client';

export function getTodayDateString(dateObj: Date = new Date()): string {
  return dateObj.toISOString().split('T')[0]; // "YYYY-MM-DD"
}

export interface AssignmentResult {
  status: 'SUCCESS' | 'EXHAUSTED';
  message?: string;
  assignment?: (ChallengeAssignment & {
    challenge: Challenge;
    session: ChallengeSession | null;
  }) | null;
}

export class ChallengeAssignmentService {
  /**
   * Get or assign today's unique daily challenge for a given user.
   * Guarantees:
   * 1. One challenge per user per day.
   * 2. No two users get the same challenge on the same day.
   * 3. User never receives a previously assigned challenge while unused challenges remain.
   * 4. Explicit pool exhaustion detection.
   */
  static async getOrAssignDailyChallenge(
    userId: string,
    targetDateStr: string = getTodayDateString()
  ): Promise<AssignmentResult> {
    // 1. Check if user already has an assignment for targetDate
    const existingAssignment = await prisma.challengeAssignment.findUnique({
      where: {
        unique_user_daily_assignment: {
          userId,
          assignedDate: targetDateStr,
        },
      },
      include: {
        challenge: true,
        session: true,
      },
    });

    if (existingAssignment) {
      return {
        status: 'SUCCESS',
        assignment: existingAssignment,
      };
    }

    // 2. Fetch all active challenge IDs
    const activeChallenges = await prisma.challenge.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    if (activeChallenges.length === 0) {
      return {
        status: 'EXHAUSTED',
        message: "Today's challenge pool is exhausted. Please ask an administrator to add more challenges.",
        assignment: null,
      };
    }

    const allActiveIds = activeChallenges.map((c) => c.id);

    // 3. Fetch challenges assigned to THIS user across ALL days
    const userPrevAssignments = await prisma.challengeAssignment.findMany({
      where: { userId },
      select: { challengeId: true },
    });
    const userPrevChallengeIds = new Set(userPrevAssignments.map((a) => a.challengeId));

    // 4. Fetch challenges assigned to ANY user TODAY
    const todayAssignments = await prisma.challengeAssignment.findMany({
      where: { assignedDate: targetDateStr },
      select: { challengeId: true },
    });
    const todayChallengeIds = new Set(todayAssignments.map((a) => a.challengeId));

    // 5. Calculate eligible challenges
    const eligibleChallengeIds = allActiveIds.filter(
      (id) => !userPrevChallengeIds.has(id) && !todayChallengeIds.has(id)
    );

    // 6. Handle Pool Exhaustion
    if (eligibleChallengeIds.length === 0) {
      return {
        status: 'EXHAUSTED',
        message: "Today's challenge pool is exhausted. Please ask an administrator to add more challenges.",
        assignment: null,
      };
    }

    // 7. Randomly pick an eligible challenge and create assignment safely inside transaction
    // Shuffle eligible list for random selection
    const shuffled = [...eligibleChallengeIds].sort(() => Math.random() - 0.5);

    for (const candidateId of shuffled) {
      try {
        const createdAssignment = await prisma.challengeAssignment.create({
          data: {
            userId,
            challengeId: candidateId,
            assignedDate: targetDateStr,
          },
          include: {
            challenge: true,
            session: true,
          },
        });

        return {
          status: 'SUCCESS',
          assignment: createdAssignment,
        };
      } catch (error: any) {
        // P2002 is Prisma Unique Constraint Violation
        if (error.code === 'P2002') {
          // Check if it was because the user got assigned concurrently
          const doubleCheck = await prisma.challengeAssignment.findUnique({
            where: {
              unique_user_daily_assignment: {
                userId,
                assignedDate: targetDateStr,
              },
            },
            include: {
              challenge: true,
              session: true,
            },
          });
          if (doubleCheck) {
            return {
              status: 'SUCCESS',
              assignment: doubleCheck,
            };
          }
          // Otherwise, candidateId was taken by another user on targetDate. Try next candidate in loop!
          continue;
        }
        throw error;
      }
    }

    // If all shuffled candidates failed due to race conditions
    return {
      status: 'EXHAUSTED',
      message: "Today's challenge pool is exhausted due to high concurrent load. Please try again.",
      assignment: null,
    };
  }
}

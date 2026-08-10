'use server';

import { getCurrentUser } from '@/lib/auth';
import { ChallengeAssignmentService } from '@/lib/services/assignment';
import { ChallengeSessionService } from '@/lib/services/session';
import { revalidatePath } from 'next/cache';

export async function getTodayChallengeAction() {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Unauthorized', status: 'UNAUTHORIZED' };
  }

  const result = await ChallengeAssignmentService.getOrAssignDailyChallenge(user.id);
  if (result.status === 'EXHAUSTED') {
    return {
      status: 'EXHAUSTED',
      message: result.message || "Today's challenge pool is exhausted. Please ask an administrator to add more challenges.",
    };
  }

  const assignment = result.assignment;
  if (!assignment) {
    return { status: 'EXHAUSTED', message: "No challenge available today." };
  }

  // If there's an active session, verify server expiration status
  let session = assignment.session;
  if (session && session.status === 'ACTIVE') {
    const updatedSession = await ChallengeSessionService.getSessionStatus(session.id, user.id);
    if (updatedSession) {
      session = updatedSession as any;
    }
  }

  return {
    status: 'SUCCESS',
    assignment: {
      id: assignment.id,
      assignedDate: assignment.assignedDate,
      challenge: assignment.challenge,
      session,
    },
    userStats: user.stats,
  };
}

export async function startChallengeAction(assignmentId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  try {
    const session = await ChallengeSessionService.startSession(assignmentId, user.id);
    revalidatePath('/');
    return { success: true, session };
  } catch (error: any) {
    return { error: error.message || 'Failed to start challenge.' };
  }
}

export async function submitChallengeAction(sessionId: string, answerPayload: any) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  try {
    const result = await ChallengeSessionService.submitAnswer({
      sessionId,
      userId: user.id,
      answerPayload,
    });

    revalidatePath('/');
    revalidatePath('/leaderboard');
    revalidatePath('/history');
    revalidatePath('/profile');

    return result;
  } catch (error: any) {
    return { error: error.message || 'Submission failed.' };
  }
}

export async function checkSessionStatusAction(sessionId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  return await ChallengeSessionService.getSessionStatus(sessionId, user.id);
}

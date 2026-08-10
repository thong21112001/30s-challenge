'use server';

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ChallengeType, Difficulty } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getTodayDateString } from '@/lib/services/assignment';

export async function checkAdminAuthorization() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin privilege required.');
  }
  return user;
}

export async function getAdminDashboardDataAction() {
  await checkAdminAuthorization();

  const totalChallenges = await prisma.challenge.count();
  const activeChallenges = await prisma.challenge.count({ where: { isActive: true } });
  const totalUsers = await prisma.user.count();

  const todayStr = getTodayDateString();
  const todayAssignmentsCount = await prisma.challengeAssignment.count({
    where: { assignedDate: todayStr },
  });

  // Calculate pool availability warning
  // If active challenges <= todayAssignmentsCount + totalUsers, pool warning flag should trigger
  const remainingForToday = activeChallenges - todayAssignmentsCount;
  const isPoolWarning = remainingForToday < totalUsers;

  const challenges = await prisma.challenge.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const recentUsers = await prisma.user.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
      stats: true,
    },
  });

  const recentAssignments = await prisma.challengeAssignment.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { username: true } },
      challenge: { select: { title: true, type: true } },
      session: { select: { status: true } },
    },
  });

  return {
    metrics: {
      totalChallenges,
      activeChallenges,
      totalUsers,
      todayAssignmentsCount,
      remainingForToday,
      isPoolWarning,
    },
    challenges,
    recentUsers,
    recentAssignments,
  };
}

export async function createChallengeAction(formData: FormData) {
  await checkAdminAuthorization();

  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const type = String(formData.get('type') || 'QUIZ') as ChallengeType;
  const difficulty = String(formData.get('difficulty') || 'MEDIUM') as Difficulty;
  const baseXp = Number(formData.get('baseXp') || 25);
  const rawPayload = String(formData.get('payloadJson') || '{}');

  if (!title || !description) {
    return { error: 'Title and description are required.' };
  }

  let payload = {};
  try {
    payload = JSON.parse(rawPayload);
  } catch (err) {
    return { error: 'Invalid JSON payload format.' };
  }

  await prisma.challenge.create({
    data: {
      title,
      description,
      type,
      difficulty,
      baseXp,
      payload,
      isActive: true,
    },
  });

  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

export async function toggleChallengeStatusAction(challengeId: string) {
  await checkAdminAuthorization();

  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge) {
    return { error: 'Challenge not found.' };
  }

  await prisma.challenge.update({
    where: { id: challengeId },
    data: { isActive: !challenge.isActive },
  });

  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

export async function editChallengeAction(challengeId: string, formData: FormData) {
  await checkAdminAuthorization();

  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const type = String(formData.get('type') || 'QUIZ') as ChallengeType;
  const difficulty = String(formData.get('difficulty') || 'MEDIUM') as Difficulty;
  const baseXp = Number(formData.get('baseXp') || 25);
  const rawPayload = String(formData.get('payloadJson') || '{}');

  if (!title || !description) {
    return { error: 'Title and description are required.' };
  }

  let payload = {};
  try {
    payload = JSON.parse(rawPayload);
  } catch (err) {
    return { error: 'Invalid JSON payload format.' };
  }

  await prisma.challenge.update({
    where: { id: challengeId },
    data: {
      title,
      description,
      type,
      difficulty,
      baseXp,
      payload,
    },
  });

  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

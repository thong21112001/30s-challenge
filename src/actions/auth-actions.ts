'use server';

import { prisma } from '@/lib/prisma';
import { hashPassword, comparePassword, setAuthCookie, removeAuthCookie, getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const identifier = String(formData.get('identifier') || '').trim();
  const password = String(formData.get('password') || '');

  if (!identifier || !password) {
    return { error: 'Please enter both username/email and password.' };
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: identifier }, { email: identifier }],
    },
  });

  if (!user) {
    return { error: 'Invalid username/email or password.' };
  }

  const match = await comparePassword(password, user.passwordHash);
  if (!match) {
    return { error: 'Invalid username/email or password.' };
  }

  await setAuthCookie({
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  });

  return { success: true };
}

export async function registerAction(formData: FormData) {
  const username = String(formData.get('username') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  if (!username || !email || !password) {
    return { error: 'All fields are required.' };
  }

  if (username.length < 3) {
    return { error: 'Username must be at least 3 characters long.' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existing) {
    return { error: 'Username or Email is already taken.' };
  }

  const passwordHash = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      role: 'USER',
      stats: {
        create: {
          totalXp: 0,
          currentStreak: 0,
          bestStreak: 0,
        },
      },
    },
  });

  await setAuthCookie({
    userId: newUser.id,
    username: newUser.username,
    email: newUser.email,
    role: newUser.role,
  });

  return { success: true };
}

export async function logoutAction() {
  await removeAuthCookie();
  redirect('/login');
}

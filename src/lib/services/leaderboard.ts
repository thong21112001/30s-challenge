import { prisma } from '@/lib/prisma';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  xp: number;
  streak: number;
}

export class LeaderboardService {
  /**
   * Fetch today's leaderboard (ranked by XP earned today)
   */
  static async getDailyLeaderboard(): Promise<LeaderboardEntry[]> {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const submissions = await prisma.submission.findMany({
      where: {
        submittedAt: {
          gte: todayStart,
        },
        isCorrect: true,
      },
      include: {
        user: {
          include: { stats: true },
        },
      },
    });

    // Aggregate XP by user for today
    const xpMap = new Map<string, { username: string; xp: number; streak: number }>();
    for (const sub of submissions) {
      const existing = xpMap.get(sub.userId) || {
        username: sub.user.username,
        xp: 0,
        streak: sub.user.stats?.currentStreak || 0,
      };
      existing.xp += sub.xpEarned;
      xpMap.set(sub.userId, existing);
    }

    const sorted = Array.from(xpMap.entries())
      .map(([userId, data]) => ({
        userId,
        username: data.username,
        xp: data.xp,
        streak: data.streak,
      }))
      .sort((a, b) => b.xp - a.xp);

    return sorted.map((item, index) => ({
      rank: index + 1,
      ...item,
    }));
  }

  /**
   * Fetch weekly leaderboard (last 7 days)
   */
  static async getWeeklyLeaderboard(): Promise<LeaderboardEntry[]> {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setUTCHours(0, 0, 0, 0);

    const submissions = await prisma.submission.findMany({
      where: {
        submittedAt: {
          gte: weekStart,
        },
        isCorrect: true,
      },
      include: {
        user: {
          include: { stats: true },
        },
      },
    });

    const xpMap = new Map<string, { username: string; xp: number; streak: number }>();
    for (const sub of submissions) {
      const existing = xpMap.get(sub.userId) || {
        username: sub.user.username,
        xp: 0,
        streak: sub.user.stats?.currentStreak || 0,
      };
      existing.xp += sub.xpEarned;
      xpMap.set(sub.userId, existing);
    }

    const sorted = Array.from(xpMap.entries())
      .map(([userId, data]) => ({
        userId,
        username: data.username,
        xp: data.xp,
        streak: data.streak,
      }))
      .sort((a, b) => b.xp - a.xp);

    return sorted.map((item, index) => ({
      rank: index + 1,
      ...item,
    }));
  }

  /**
   * Fetch all-time leaderboard (by UserStats totalXp)
   */
  static async getAllTimeLeaderboard(): Promise<LeaderboardEntry[]> {
    const users = await prisma.user.findMany({
      include: { stats: true },
      orderBy: {
        stats: {
          totalXp: 'desc',
        },
      },
    });

    return users.map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      username: user.username,
      xp: user.stats?.totalXp || 0,
      streak: user.stats?.currentStreak || 0,
    }));
  }
}

import { getCurrentUser } from '@/lib/auth';
import { getTodayChallengeAction } from '@/actions/challenge-actions';
import { Navbar } from '@/components/navbar';
import { OfflineBanner } from '@/components/offline-banner';
import { ChallengeCard } from '@/components/challenge-card';
import { LeaderboardService } from '@/lib/services/leaderboard';
import { redirect } from 'next/navigation';
import { Flame, Trophy, AlertTriangle, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const challengeData = await getTodayChallengeAction();
  const dailyLeaderboard = await LeaderboardService.getDailyLeaderboard();
  const userRank = dailyLeaderboard.find((entry) => entry.userId === user.id)?.rank || '-';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      <OfflineBanner />
      <Navbar user={user} />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 sm:py-12 w-full">
        {/* Header Hero Greeting */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-extrabold text-indigo-400 mb-3 shadow-inner">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce" />
            <span>{user.stats?.currentStreak || 0} DAY STREAK</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
            TODAY'S <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500">30s CHALLENGE</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-medium">
            One unique challenge per user per day. 30-second server deadline.
          </p>
        </div>

        {/* Pool Exhaustion Handling */}
        {challengeData.status === 'EXHAUSTED' ? (
          <div className="w-full max-w-2xl mx-auto bg-amber-500/10 border border-amber-500/30 rounded-3xl p-8 text-center backdrop-blur-xl shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">
              POOL EXHAUSTED
            </h2>
            <p className="text-amber-200 text-sm max-w-md mx-auto mb-6 leading-relaxed font-medium">
              {challengeData.message || "Today's challenge pool is exhausted. Please ask an administrator to add more challenges."}
            </p>
            {user.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm hover:bg-amber-400 transition-all"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Go to Admin Dashboard to Add Challenges</span>
              </Link>
            )}
          </div>
        ) : challengeData.assignment ? (
          /* Active / Assigned Daily Challenge Card */
          <ChallengeCard assignment={challengeData.assignment as any} />
        ) : null}

        {/* Today's Mini Rank Footer Card */}
        <div className="mt-10 max-w-2xl mx-auto flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium">Today's Daily Rank</span>
              <p className="font-extrabold text-white text-sm">
                {userRank !== '-' ? `#${userRank} on Leaderboard` : 'Unranked today'}
              </p>
            </div>
          </div>
          <Link
            href="/leaderboard"
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1"
          >
            <span>View Rankings</span>
            <span>→</span>
          </Link>
        </div>
      </main>
    </div>
  );
}

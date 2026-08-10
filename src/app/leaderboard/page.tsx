import { getCurrentUser } from '@/lib/auth';
import { LeaderboardService } from '@/lib/services/leaderboard';
import { Navbar } from '@/components/navbar';
import { OfflineBanner } from '@/components/offline-banner';
import { redirect } from 'next/navigation';
import { Trophy, Flame, Zap, Award } from 'lucide-react';
import Link from 'next/link';

interface LeaderboardPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const resolvedParams = await searchParams;
  const currentTab = resolvedParams.tab || 'daily';

  let entries = [];
  if (currentTab === 'weekly') {
    entries = await LeaderboardService.getWeeklyLeaderboard();
  } else if (currentTab === 'alltime') {
    entries = await LeaderboardService.getAllTimeLeaderboard();
  } else {
    entries = await LeaderboardService.getDailyLeaderboard();
  }

  const tabs = [
    { key: 'daily', label: "Today's XP" },
    { key: 'weekly', label: 'Weekly XP' },
    { key: 'alltime', label: 'All-Time XP' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      <OfflineBanner />
      <Navbar user={user} />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 sm:py-12 w-full">
        {/* Header Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold mb-3">
            <Trophy className="w-4 h-4 fill-amber-400" />
            <span>GLOBAL ARENA LEADERBOARD</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
            CHALLENGE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-pink-500">RANKINGS</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">
            See who holds the highest XP and daily streaks across the test group
          </p>
        </div>

        {/* Tabs Filter */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1">
            {tabs.map((t) => {
              const isActive = currentTab === t.key;
              return (
                <Link
                  key={t.key}
                  href={`/leaderboard?tab=${t.key}`}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Table Container */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
          {entries.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Award className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="font-bold text-slate-300">No submissions recorded for this period yet.</p>
              <p className="text-xs text-slate-500 mt-1">Be the first to complete today's challenge!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => {
                const isCurrentUser = entry.userId === user.id;

                let rankBadge = (
                  <span className="font-mono font-bold text-slate-400 text-sm">
                    #{entry.rank}
                  </span>
                );

                if (entry.rank === 1) {
                  rankBadge = (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-600 text-slate-950 flex items-center justify-center font-black text-sm shadow-lg shadow-amber-500/30">
                      1
                    </div>
                  );
                } else if (entry.rank === 2) {
                  rankBadge = (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-300 to-slate-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
                      2
                    </div>
                  );
                } else if (entry.rank === 3) {
                  rankBadge = (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-700 to-amber-900 text-amber-200 flex items-center justify-center font-black text-sm shadow-md">
                      3
                    </div>
                  );
                }

                return (
                  <div
                    key={entry.userId}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                      isCurrentUser
                        ? 'bg-indigo-600/10 border-indigo-500/40 shadow-lg shadow-indigo-500/5'
                        : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 flex items-center justify-center">
                        {rankBadge}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-extrabold text-sm ${isCurrentUser ? 'text-indigo-400' : 'text-white'}`}>
                            {entry.username}
                          </span>
                          {isCurrentUser && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                            <Flame className="w-3 h-3 fill-amber-400" />
                            {entry.streak}d streak
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-emerald-400 font-black text-base bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/20">
                      <Zap className="w-4 h-4 fill-emerald-400" />
                      <span>+{entry.xp} XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

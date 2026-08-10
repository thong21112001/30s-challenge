import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/navbar';
import { OfflineBanner } from '@/components/offline-banner';
import { redirect } from 'next/navigation';
import { User as UserIcon, Flame, Zap, Award, CheckCircle2, ShieldCheck } from 'lucide-react';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const totalAssigned = await prisma.challengeAssignment.count({
    where: { userId: user.id },
  });

  const totalSubmissions = await prisma.submission.count({
    where: { userId: user.id },
  });

  const totalCorrect = await prisma.submission.count({
    where: { userId: user.id, isCorrect: true },
  });

  const winRate = totalSubmissions > 0 ? Math.round((totalCorrect / totalSubmissions) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      <OfflineBanner />
      <Navbar user={user} />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 sm:py-12 w-full">
        {/* Profile Card Header */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-600/30">
              {user.username.substring(0, 2).toUpperCase()}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{user.username}</h1>
                {user.role === 'ADMIN' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>ADMIN</span>
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-xs">{user.email}</p>
              <p className="text-[11px] font-mono text-slate-500">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-2">
              <Zap className="w-5 h-5 fill-amber-400" />
            </div>
            <span className="text-2xl font-black text-white">{user.stats?.totalXp || 0}</span>
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-1">
              Total XP
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-2">
              <Flame className="w-5 h-5 fill-amber-400" />
            </div>
            <span className="text-2xl font-black text-white">{user.stats?.currentStreak || 0}d</span>
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-1">
              Current Streak
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-2">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-white">{user.stats?.bestStreak || 0}d</span>
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-1">
              Best Streak
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-white">{winRate}%</span>
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-1">
              Success Rate
            </p>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="font-extrabold text-white text-base mb-4">CHALLENGE BREAKDOWN</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Total Challenges Assigned</span>
              <span className="font-mono font-bold text-white">{totalAssigned}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Submissions Attempted</span>
              <span className="font-mono font-bold text-white">{totalSubmissions}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Successful Solves</span>
              <span className="font-mono font-bold text-emerald-400">{totalCorrect}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

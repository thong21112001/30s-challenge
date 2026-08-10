import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/navbar';
import { OfflineBanner } from '@/components/offline-banner';
import { redirect } from 'next/navigation';
import { History as HistoryIcon, CheckCircle2, XCircle, Clock, Zap, Calendar } from 'lucide-react';

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const assignments = await prisma.challengeAssignment.findMany({
    where: { userId: user.id },
    orderBy: { assignedDate: 'desc' },
    include: {
      challenge: true,
      session: {
        include: { submission: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      <OfflineBanner />
      <Navbar user={user} />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 sm:py-12 w-full">
        {/* Header Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 text-xs font-extrabold mb-3">
            <HistoryIcon className="w-4 h-4" />
            <span>CHALLENGE ARCHIVE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
            YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">HISTORY</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">
            Every challenge you've received is logged here and guaranteed never to repeat for you.
          </p>
        </div>

        {/* Assignments History List */}
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="font-bold text-slate-300">No challenge history recorded yet.</p>
              <p className="text-xs text-slate-500 mt-1">Start today's challenge from the home screen!</p>
            </div>
          ) : (
            assignments.map((item) => {
              const session = item.session;
              const submission = session?.submission;

              let statusBadge = (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-bold border border-slate-700">
                  <Clock className="w-3.5 h-3.5" />
                  <span>NOT STARTED</span>
                </div>
              );

              if (session?.status === 'COMPLETED') {
                if (submission?.isCorrect) {
                  statusBadge = (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>COMPLETED</span>
                    </div>
                  );
                } else {
                  statusBadge = (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/30">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>FAILED</span>
                    </div>
                  );
                }
              } else if (session?.status === 'EXPIRED') {
                statusBadge = (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/30">
                    <Clock className="w-3.5 h-3.5" />
                    <span>EXPIRED</span>
                  </div>
                );
              }

              const xpGained = submission?.isCorrect ? submission.xpEarned : 0;

              return (
                <div
                  key={item.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        {item.assignedDate}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-indigo-300 border border-slate-700">
                        {item.challenge.type}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-amber-300 border border-slate-700">
                        {item.challenge.difficulty}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-white text-lg tracking-tight">
                      {item.challenge.title}
                    </h3>
                    <p className="text-xs text-slate-400">{item.challenge.description}</p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    {statusBadge}
                    <div className="flex items-center gap-1 text-sm font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                      <Zap className="w-4 h-4 fill-amber-400" />
                      <span>+{xpGained} XP</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

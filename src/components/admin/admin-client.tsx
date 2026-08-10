'use client';

import { useState } from 'react';
import { createChallengeAction, toggleChallengeStatusAction } from '@/actions/admin-actions';
import { ShieldAlert, Plus, Power, Users, Database, AlertTriangle, CheckCircle2, Zap, LayoutList, Layers } from 'lucide-react';

interface AdminDashboardClientProps {
  data: {
    metrics: {
      totalChallenges: number;
      activeChallenges: number;
      totalUsers: number;
      todayAssignmentsCount: number;
      remainingForToday: number;
      isPoolWarning: boolean;
    };
    challenges: Array<{
      id: string;
      title: string;
      description: string;
      type: 'QUIZ' | 'TEXT' | 'ACTION';
      difficulty: 'EASY' | 'MEDIUM' | 'HARD';
      baseXp: number;
      payload: any;
      isActive: boolean;
      createdAt: string;
    }>;
    recentUsers: Array<{
      id: string;
      username: string;
      email: string;
      role: string;
      createdAt: string;
      stats?: {
        totalXp: number;
        currentStreak: number;
      } | null;
    }>;
    recentAssignments: Array<{
      id: string;
      assignedDate: string;
      user: { username: string };
      challenge: { title: string; type: string };
      session?: { status: string } | null;
    }>;
  };
}

export function AdminDashboardClient({ data }: AdminDashboardClientProps) {
  const { metrics, challenges, recentUsers, recentAssignments } = data;

  const [activeTab, setActiveTab] = useState<'POOL' | 'USERS' | 'ASSIGNMENTS'>('POOL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Default payload generator helper for modal
  const [challengeType, setChallengeType] = useState<'QUIZ' | 'TEXT' | 'ACTION'>('QUIZ');
  const defaultPayloads = {
    QUIZ: JSON.stringify({ question: 'Sample Question?', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A' }, null, 2),
    TEXT: JSON.stringify({ prompt: 'Type this exact sentence:', targetText: 'Sample text to type fast.', mode: 'EXACT' }, null, 2),
    ACTION: JSON.stringify({ actionType: 'CLICK_TARGET', targetCount: 10, instructions: 'Click the button 10 times fast!' }, null, 2),
  };
  const [payloadText, setPayloadText] = useState(defaultPayloads.QUIZ);

  async function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setCreateError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('payloadJson', payloadText);

    const res = await createChallengeAction(formData);
    setIsSubmitting(false);

    if (res.error) {
      setCreateError(res.error);
    } else {
      setShowCreateModal(false);
    }
  }

  async function handleToggleStatus(challengeId: string) {
    await toggleChallengeStatusAction(challengeId);
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ADMIN CONTROL CENTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            CHALLENGE POOL & SYSTEM ADMIN
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Manage pool exhaustion, user assignments, and challenge creation.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="py-3 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>CREATE CHALLENGE</span>
        </button>
      </div>

      {/* POOL EXHAUSTION WARNING BANNER */}
      {metrics.isPoolWarning && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-6 backdrop-blur-xl flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-rose-300 text-base">
              ⚠ POOL EXHAUSTION WARNING!
            </h3>
            <p className="text-rose-200/80 text-xs mt-1 leading-relaxed">
              Active pool has remaining capacity of <strong className="text-white">{metrics.remainingForToday}</strong> for today, but total user count is <strong className="text-white">{metrics.totalUsers}</strong>. Please create more active challenges to prevent users from receiving pool exhaustion errors!
            </p>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase font-bold">Total Pool</span>
            <Database className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-2xl font-black text-white">{metrics.totalChallenges}</span>
          <p className="text-[11px] text-slate-500 mt-1">{metrics.activeChallenges} Active</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase font-bold">Registered Users</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-2xl font-black text-white">{metrics.totalUsers}</span>
          <p className="text-[11px] text-slate-500 mt-1">Initial test group</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase font-bold">Today Assigned</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-white">{metrics.todayAssignmentsCount}</span>
          <p className="text-[11px] text-slate-500 mt-1">Unique daily locks</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase font-bold">Pool Headroom</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <span className={`text-2xl font-black ${metrics.remainingForToday < 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {metrics.remainingForToday}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Remaining for today</p>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('POOL')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'POOL' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          Challenge Pool ({challenges.length})
        </button>
        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'USERS' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          User Roster ({recentUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('ASSIGNMENTS')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'ASSIGNMENTS' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          Assignments Log ({recentAssignments.length})
        </button>
      </div>

      {/* TAB 1: CHALLENGE POOL */}
      {activeTab === 'POOL' && (
        <div className="space-y-3">
          {challenges.map((c) => (
            <div
              key={c.id}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                c.isActive ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-base">{c.title}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-indigo-300 border border-slate-700">
                    {c.type}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-amber-300 border border-slate-700">
                    {c.difficulty} (+{c.baseXp} XP)
                  </span>
                </div>
                <p className="text-xs text-slate-400">{c.description}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleStatus(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                    c.isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-emerald-500/10 hover:text-emerald-400'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{c.isActive ? 'ENABLED' : 'DISABLED'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: USER ROSTER */}
      {activeTab === 'USERS' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 text-slate-400 uppercase font-mono">
              <tr>
                <th className="p-3">Username</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Total XP</th>
                <th className="p-3">Streak</th>
                <th className="p-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentUsers.map((u) => (
                <tr key={u.id}>
                  <td className="p-3 font-bold text-white">{u.username}</td>
                  <td className="p-3 text-slate-400">{u.email}</td>
                  <td className="p-3 font-mono font-bold text-indigo-400">{u.role}</td>
                  <td className="p-3 font-bold text-emerald-400">+{u.stats?.totalXp || 0} XP</td>
                  <td className="p-3 font-bold text-amber-400">{u.stats?.currentStreak || 0}d</td>
                  <td className="p-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: ASSIGNMENTS LOG */}
      {activeTab === 'ASSIGNMENTS' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 text-slate-400 uppercase font-mono">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">User</th>
                <th className="p-3">Challenge Title</th>
                <th className="p-3">Type</th>
                <th className="p-3">Session Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentAssignments.map((a) => (
                <tr key={a.id}>
                  <td className="p-3 font-mono text-slate-400">{a.assignedDate}</td>
                  <td className="p-3 font-bold text-indigo-400">{a.user.username}</td>
                  <td className="p-3 font-semibold text-white">{a.challenge.title}</td>
                  <td className="p-3 text-slate-400">{a.challenge.type}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-slate-800 text-slate-300">
                      {a.session?.status || 'NO SESSION'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE CHALLENGE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <h2 className="text-xl font-black text-white mb-4">CREATE NEW CHALLENGE</h2>

            {createError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Title</label>
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Speed Math Challenge"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Description</label>
                <input
                  name="description"
                  type="text"
                  required
                  placeholder="e.g. Solve the equation in under 30 seconds"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Type</label>
                  <select
                    name="type"
                    value={challengeType}
                    onChange={(e) => {
                      const t = e.target.value as 'QUIZ' | 'TEXT' | 'ACTION';
                      setChallengeType(t);
                      setPayloadText(defaultPayloads[t]);
                    }}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  >
                    <option value="QUIZ">QUIZ</option>
                    <option value="TEXT">TEXT</option>
                    <option value="ACTION">ACTION</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Difficulty</label>
                  <select
                    name="difficulty"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Base XP</label>
                  <input
                    name="baseXp"
                    type="number"
                    defaultValue={25}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Payload JSON Config
                </label>
                <textarea
                  value={payloadText}
                  onChange={(e) => setPayloadText(e.target.value)}
                  rows={5}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30"
                >
                  {isSubmitting ? 'Creating...' : 'Save Challenge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

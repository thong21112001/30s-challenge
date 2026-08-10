'use client';

import { useState } from 'react';
import { loginAction } from '@/actions/auth-actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await loginAction(formData);

    setLoading(false);
    if (res?.error) {
      setError(res.error);
    } else if (res?.success) {
      router.push('/');
      router.refresh();
    }
  }

  // Quick helper for demo testing logins
  function fillDemo(username: string, pass: string) {
    const userInput = document.getElementById('identifier') as HTMLInputElement;
    const passInput = document.getElementById('password') as HTMLInputElement;
    if (userInput) userInput.value = username;
    if (passInput) passInput.value = pass;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background neon elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/25">
            <span className="font-extrabold text-white text-xl tracking-tighter">30s</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">WELCOME BACK</h1>
          <p className="text-slate-400 text-xs mt-1 font-medium">
            Log in to claim today's 30-second challenge
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Username or Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                placeholder="e.g. user1 or admin"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
          >
            {loading ? (
              <span>Logging in...</span>
            ) : (
              <>
                <span>ENTER ARENA</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Test Logins Widget */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
            ⚡ Quick Test Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin', 'admin123')}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-bold text-amber-400 hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin (admin123)</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('user1', 'user123')}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-bold text-indigo-400 hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>User1 (user123)</span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          Don't have an account?{' '}
          <Link href="/register" className="text-indigo-400 font-bold hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, Trophy, History, User as UserIcon, ShieldAlert, LogOut, Zap } from 'lucide-react';
import { logoutAction } from '@/actions/auth-actions';

interface NavbarProps {
  user: {
    username: string;
    role: string;
    stats?: {
      totalXp: number;
      currentStreak: number;
    } | null;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  if (!user) return null;

  const navLinks = [
    { href: '/', label: 'Today', icon: Zap },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/history', label: 'History', icon: History },
    { href: '/profile', label: 'Profile', icon: UserIcon },
  ];

  if (user.role === 'ADMIN') {
    navLinks.push({ href: '/admin', label: 'Admin', icon: ShieldAlert });
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-all duration-300">
            <span className="font-extrabold text-white text-lg tracking-tighter">30s</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-indigo-300 text-lg leading-tight">
              CHALLENGE
            </span>
            <span className="text-[10px] font-mono tracking-wider text-indigo-400 font-semibold uppercase">
              Server-Authoritative Arena
            </span>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Stats Pill & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
              <Flame className="w-4 h-4 fill-amber-400 animate-pulse" />
              <span>{user.stats?.currentStreak || 0}d</span>
            </div>
            <div className="w-px h-3.5 bg-slate-800" />
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-extrabold">
              <Zap className="w-3.5 h-3.5 fill-emerald-400" />
              <span>{user.stats?.totalXp || 0} XP</span>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              title="Logout"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-950/95 py-2 px-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                isActive ? 'text-indigo-400' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}

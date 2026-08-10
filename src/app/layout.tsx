import type { Metadata } from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: '30s Challenge | Daily Server-Authoritative Arena',
  description: 'One unique 30-second challenge per user per day. Real-time timer, streaks, leaderboards, and zero repeated challenges.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable} dark h-full antialiased`}>
      <body className="min-h-full bg-slate-950 text-slate-100 flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}

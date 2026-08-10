'use client';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Timer } from '@/components/timer';
import { startChallengeAction, submitChallengeAction } from '@/actions/challenge-actions';
import { Play, CheckCircle2, XCircle, AlertTriangle, Zap, ArrowRight, RefreshCw, Trophy, Flame } from 'lucide-react';

interface ChallengeCardProps {
  assignment: {
    id: string;
    assignedDate: string;
    challenge: {
      id: string;
      title: string;
      description: string;
      type: 'QUIZ' | 'TEXT' | 'ACTION';
      difficulty: 'EASY' | 'MEDIUM' | 'HARD';
      baseXp: number;
      payload: any;
    };
    session?: {
      id: string;
      startedAt: string | Date;
      expiresAt: string | Date;
      status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
      submission?: {
        isCorrect: boolean;
        xpEarned: number;
      } | null;
    } | null;
  };
  onRefreshData?: () => void;
}

export function ChallengeCard({ assignment, onRefreshData }: ChallengeCardProps) {
  const challenge = assignment.challenge;
  const session = assignment.session;

  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSession, setActiveSession] = useState(session);

  // User input state
  const [quizSelected, setQuizSelected] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [clickCount, setClickCount] = useState<number>(0);
  const [orderedClicks, setOrderedClicks] = useState<number[]>([]);
  const [mathInput, setMathInput] = useState<string>('');
  const [sliderVal, setSliderVal] = useState<number>(50);
  const [unscrambleInput, setUnscrambleInput] = useState<string>('');

  const [resultState, setResultState] = useState<{
    status: 'COMPLETED' | 'EXPIRED' | null;
    isCorrect?: boolean;
    xpEarned?: number;
    message?: string;
  } | null>(() => {
    if (session?.submission) {
      return {
        status: session.status as any,
        isCorrect: session.submission.isCorrect,
        xpEarned: session.submission.xpEarned,
      };
    }
    if (session?.status === 'EXPIRED') {
      return { status: 'EXPIRED', isCorrect: false, xpEarned: 0 };
    }
    return null;
  });

  useEffect(() => {
    setActiveSession(session);
    if (session?.submission) {
      setResultState({
        status: session.status as any,
        isCorrect: session.submission.isCorrect,
        xpEarned: session.submission.xpEarned,
      });
    } else if (session?.status === 'EXPIRED') {
      setResultState({ status: 'EXPIRED', isCorrect: false, xpEarned: 0 });
    }
  }, [session]);

  // Handle Start Challenge
  async function handleStart() {
    setIsStarting(true);
    const res = await startChallengeAction(assignment.id);
    setIsStarting(false);

    if (res.success && res.session) {
      setActiveSession(res.session as any);
    } else if (res.error) {
      alert(res.error);
    }
  }

  // Handle Answer Submission
  async function handleSubmit(payloadOverride?: any) {
    if (!activeSession || isSubmitting) return;
    setIsSubmitting(true);

    let answerPayload: any = {};

    if (payloadOverride) {
      answerPayload = payloadOverride;
    } else if (challenge.type === 'QUIZ') {
      answerPayload = { answer: quizSelected };
    } else if (challenge.type === 'TEXT') {
      answerPayload = { text: textInput };
    } else if (challenge.type === 'ACTION') {
      const actType = challenge.payload?.actionType;
      if (actType === 'CLICK_TARGET') answerPayload = { clickCount };
      else if (actType === 'ORDER_CLICK') answerPayload = { clicks: orderedClicks };
      else if (actType === 'MATH_SOLVER') answerPayload = { answer: mathInput };
      else if (actType === 'SLIDER_TARGET') answerPayload = { value: sliderVal };
      else if (actType === 'WORD_UNSCRAMBLE') answerPayload = { word: unscrambleInput };
    }

    const res: any = await submitChallengeAction(activeSession.id, answerPayload);
    setIsSubmitting(false);

    if (res?.status === 'COMPLETED') {
      setResultState({
        status: 'COMPLETED',
        isCorrect: res.isCorrect,
        xpEarned: res.xpEarned,
      });
      if (res.isCorrect) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#ec4899', '#10b981', '#f59e0b'],
        });
      }
    } else if (res?.status === 'EXPIRED') {
      setResultState({
        status: 'EXPIRED',
        isCorrect: false,
        xpEarned: 0,
        message: res.message,
      });
    }

    if (onRefreshData) onRefreshData();
  }

  // Timer Expiration Callback
  function handleTimerExpire() {
    if (activeSession && activeSession.status === 'ACTIVE' && !resultState) {
      setResultState({
        status: 'EXPIRED',
        isCorrect: false,
        xpEarned: 0,
        message: "Time's up! Challenge expired.",
      });
      // Submit empty timeout payload
      handleSubmit({ timeout: true });
    }
  }

  const difficultyColors = {
    EASY: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    MEDIUM: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    HARD: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      {/* Background neon glow element */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${difficultyColors[challenge.difficulty]}`}>
            {challenge.difficulty}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-800 text-slate-300 border border-slate-700">
            {challenge.type}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-black text-amber-400 text-sm bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
          <Zap className="w-4 h-4 fill-amber-400" />
          <span>+{challenge.baseXp} XP</span>
        </div>
      </div>

      {/* Challenge Title & Description */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          {challenge.title}
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
          {challenge.description}
        </p>
      </div>

      {/* STATE 1: PENDING (NOT STARTED YET) */}
      {!activeSession && !resultState && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-24 h-24 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-6 animate-pulse shadow-xl shadow-indigo-500/10">
            <Zap className="w-10 h-10 text-indigo-400" />
          </div>
          <p className="text-xs text-slate-400 mb-6 font-mono tracking-wide uppercase">
            Strict 30-second window starts when you press start
          </p>
          <button
            onClick={handleStart}
            disabled={isStarting}
            className="w-full sm:w-64 py-4 px-8 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold text-lg shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isStarting ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>START CHALLENGE</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* STATE 2: ACTIVE (IN PROGRESS) */}
      {activeSession && activeSession.status === 'ACTIVE' && !resultState && (
        <div>
          {/* Server Authoritative Timer Ring */}
          <Timer expiresAt={activeSession.expiresAt} onExpire={handleTimerExpire} />

          {/* Interactive Challenge Input Body */}
          <div className="mt-6 space-y-6">
            {/* TYPE: QUIZ */}
            {challenge.type === 'QUIZ' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center font-bold text-white text-base">
                  {challenge.payload?.question}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {challenge.payload?.options?.map((opt: string, idx: number) => {
                    const isSelected = quizSelected === opt;
                    return (
                      <button
                        key={idx}
                        onClick={() => setQuizSelected(opt)}
                        className={`p-4 rounded-2xl font-semibold text-sm border text-left transition-all duration-200 ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30 scale-[1.01]'
                            : 'bg-slate-950/40 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                        }`}
                      >
                        <span className="inline-block w-6 text-indigo-400 font-mono font-bold">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TYPE: TEXT */}
            {challenge.type === 'TEXT' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-200 text-sm font-medium">
                  <p className="font-bold text-indigo-400 mb-1">{challenge.payload?.prompt}</p>
                  {challenge.payload?.targetText && (
                    <p className="font-mono text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-amber-300 select-all">
                      {challenge.payload.targetText}
                    </p>
                  )}
                </div>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={3}
                  className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-sm"
                  autoFocus
                />
              </div>
            )}

            {/* TYPE: ACTION */}
            {challenge.type === 'ACTION' && (
              <div className="space-y-4">
                <p className="text-center font-bold text-indigo-400 text-sm">
                  {challenge.payload?.instructions || 'Complete the interactive action task!'}
                </p>

                {/* CLICK_TARGET */}
                {challenge.payload?.actionType === 'CLICK_TARGET' && (
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="text-center">
                      <span className="text-4xl font-black text-white">{clickCount}</span>
                      <span className="text-slate-400 text-sm"> / {challenge.payload.targetCount} Clicks</span>
                    </div>
                    <button
                      onClick={() => {
                        const next = clickCount + 1;
                        setClickCount(next);
                        if (next >= challenge.payload.targetCount) {
                          handleSubmit({ clickCount: next });
                        }
                      }}
                      className="w-32 h-32 rounded-full bg-gradient-to-tr from-pink-600 to-indigo-600 text-white font-black text-xl shadow-2xl shadow-pink-500/30 active:scale-90 hover:scale-105 transition-all duration-150 flex items-center justify-center"
                    >
                      CLICK!
                    </button>
                  </div>
                )}

                {/* ORDER_CLICK */}
                {challenge.payload?.actionType === 'ORDER_CLICK' && (
                  <div className="space-y-4">
                    <div className="flex justify-center gap-2">
                      <span className="text-xs font-mono text-slate-400">Selected sequence:</span>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {orderedClicks.join(', ') || 'None'}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-3 max-w-sm mx-auto">
                      {challenge.payload?.numbers?.map((num: number, idx: number) => {
                        const isClicked = orderedClicks.includes(num);
                        return (
                          <button
                            key={idx}
                            disabled={isClicked}
                            onClick={() => setOrderedClicks((prev) => [...prev, num])}
                            className={`h-14 rounded-2xl font-black text-lg border transition-all ${
                              isClicked
                                ? 'bg-slate-800 text-slate-600 border-slate-800'
                                : 'bg-indigo-600 text-white border-indigo-400 hover:scale-105 shadow-md shadow-indigo-600/20'
                            }`}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                    {orderedClicks.length > 0 && (
                      <div className="text-center">
                        <button
                          onClick={() => setOrderedClicks([])}
                          className="text-xs text-rose-400 hover:underline"
                        >
                          Reset Selection
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* MATH_SOLVER */}
                {challenge.payload?.actionType === 'MATH_SOLVER' && (
                  <div className="flex flex-col items-center gap-4 py-2">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-2xl font-black text-amber-400 tracking-wider">
                      {challenge.payload.equation} = ?
                    </div>
                    <input
                      type="number"
                      value={mathInput}
                      onChange={(e) => setMathInput(e.target.value)}
                      placeholder="Enter number..."
                      className="w-48 text-center p-3 rounded-2xl bg-slate-950 border border-slate-800 text-white font-black text-xl focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* SLIDER_TARGET */}
                {challenge.payload?.actionType === 'SLIDER_TARGET' && (
                  <div className="flex flex-col items-center gap-4 py-4 max-w-md mx-auto">
                    <div className="flex items-center justify-between w-full font-bold text-sm">
                      <span className="text-slate-400">Target Value: <strong className="text-amber-400 text-lg">{challenge.payload.targetValue}</strong></span>
                      <span className="text-slate-400">Current Value: <strong className="text-indigo-400 text-lg">{sliderVal}</strong></span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderVal}
                      onChange={(e) => setSliderVal(Number(e.target.value))}
                      className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                )}

                {/* WORD_UNSCRAMBLE */}
                {challenge.payload?.actionType === 'WORD_UNSCRAMBLE' && (
                  <div className="flex flex-col items-center gap-4 py-2">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-2xl font-black text-pink-400 tracking-widest uppercase">
                      {challenge.payload.scrambled}
                    </div>
                    <input
                      type="text"
                      value={unscrambleInput}
                      onChange={(e) => setUnscrambleInput(e.target.value.toUpperCase())}
                      placeholder="Type unscrambled word..."
                      className="w-64 text-center p-3 rounded-2xl bg-slate-950 border border-slate-800 text-white font-black text-lg focus:border-indigo-500 focus:outline-none uppercase tracking-wider"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Submit Action Button */}
            <button
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-indigo-600 text-white font-black text-base shadow-xl shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {isSubmitting ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>SUBMIT ANSWER</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STATE 3: RESULT STATE (COMPLETED / EXPIRED) */}
      {resultState && (
        <div className="text-center py-6 space-y-6">
          {resultState.status === 'COMPLETED' && resultState.isCorrect && (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400 shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight mb-1">
                🎉 CHALLENGE COMPLETED!
              </h3>
              <p className="text-emerald-400 font-bold text-lg mb-4">
                +{resultState.xpEarned} XP EARNED
              </p>
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 max-w-sm w-full text-slate-300 text-xs">
                Great job! Your answer was verified server-side. Check your position on today's leaderboard!
              </div>
            </div>
          )}

          {resultState.status === 'COMPLETED' && !resultState.isCorrect && (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4 text-rose-400 shadow-xl shadow-rose-500/20">
                <XCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight mb-1">
                INCORRECT ANSWER
              </h3>
              <p className="text-rose-400 font-bold text-lg mb-4">+0 XP</p>
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 max-w-sm w-full text-slate-300 text-xs">
                Incorrect input. Daily streak reset to 0. Better luck on tomorrow's challenge!
              </div>
            </div>
          )}

          {resultState.status === 'EXPIRED' && (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400 shadow-xl shadow-amber-500/20">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight mb-1">
                ⏰ TIME'S UP!
              </h3>
              <p className="text-amber-400 font-bold text-lg mb-4">+0 XP</p>
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 max-w-sm w-full text-slate-300 text-xs">
                {resultState.message || 'The 30-second server execution window expired.'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useEffect } from 'react';
import { RotateCcw, Menu, Trophy, Coins, Footprints, Gauge, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DifficultyLevel, GameStats, HighScoreRecord } from '../types';
import { DIFFICULTY_CONFIGS } from '../data/difficulties';

interface GameOverModalProps {
  stats: GameStats;
  difficulty: DifficultyLevel;
  highScore: HighScoreRecord;
  isNewRecord: boolean;
  onRestart: () => void;
  onOpenMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  difficulty,
  highScore,
  isNewRecord,
  onRestart,
  onOpenMenu,
}) => {
  const config = DIFFICULTY_CONFIGS[difficulty];

  useEffect(() => {
    if (isNewRecord) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ffd700', '#f59e0b', '#3b82f6', '#10b981'],
        });
      } catch {
        // ignore
      }
    }
  }, [isNewRecord]);

  return (
    <div
      id="game-over-overlay"
      className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 z-20"
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-1">
          {isNewRecord ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black animate-pulse">
              <Sparkles className="w-3.5 h-3.5" /> 신기록 달성! (NEW RECORD)
            </div>
          ) : (
            <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              충돌! 게임 오버
            </div>
          )}
          <h2 className="text-3xl font-black text-white mt-1">
            {isNewRecord ? '대단한 기록입니다!' : '아쉽네요!'}
          </h2>
          <div className="text-xs text-slate-400">
            {config.name}
          </div>
        </div>

        {/* Score Hero Card */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center flex flex-col gap-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">최종 점수</div>
          <div className="text-4xl font-black text-amber-400 font-mono tracking-tight">
            {stats.score.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1 font-mono">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>최고 기록: {Math.max(highScore.score, stats.score).toLocaleString()}</span>
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex flex-col items-center gap-1">
            <Footprints className="w-4 h-4 text-sky-400" />
            <span className="text-[10px] text-slate-400 font-semibold uppercase">거리</span>
            <span className="font-mono font-bold text-sm text-white">{stats.distance}m</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex flex-col items-center gap-1">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] text-slate-400 font-semibold uppercase">골드 바</span>
            <span className="font-mono font-bold text-sm text-amber-300">{stats.gold}개</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-850 border border-slate-800 flex flex-col items-center gap-1">
            <Gauge className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] text-slate-400 font-semibold uppercase">최종 속도</span>
            <span className="font-mono font-bold text-sm text-white">{stats.speed}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            id="game-restart-btn"
            type="button"
            onClick={onRestart}
            className="w-full py-3.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>다시 달리기</span>
          </button>

          <button
            id="game-change-difficulty-btn"
            type="button"
            onClick={onOpenMenu}
            className="w-full py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span>난이도 변경 / 메뉴</span>
          </button>
        </div>
      </div>
    </div>
  );
};

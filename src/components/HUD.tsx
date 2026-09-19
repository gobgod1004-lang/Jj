import React from 'react';
import { Volume2, VolumeX, Pause, Play, Coins, Gauge } from 'lucide-react';
import { DifficultyLevel, GameStats } from '../types';
import { DIFFICULTY_CONFIGS } from '../data/difficulties';

interface HUDProps {
  stats: GameStats;
  difficulty: DifficultyLevel;
  isPaused: boolean;
  isMuted: boolean;
  speedUpNotice: string | null;
  onTogglePause: () => void;
  onToggleMute: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  difficulty,
  isPaused,
  isMuted,
  speedUpNotice,
  onTogglePause,
  onToggleMute,
}) => {
  const config = DIFFICULTY_CONFIGS[difficulty];

  return (
    <header className="absolute inset-x-0 top-0 p-3 sm:p-5 pointer-events-none select-none z-10 flex flex-col gap-2">
      {/* Top Status Bar (Bright & Glassmorphism) */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
        {/* Left: Difficulty & Speed */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div
            id="difficulty-badge"
            className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-black border border-white/80 backdrop-blur-md transition-all shadow-md bg-white/90 text-slate-800"
          >
            {config.name}
          </div>

          <div
            id="speed-indicator"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold border border-white/80 bg-white/90 text-slate-700 backdrop-blur-md shadow-md"
          >
            <Gauge className="w-3.5 h-3.5 text-sky-600" />
            <span>속도:</span>
            <span className="font-mono font-black text-slate-900">{stats.speed}</span>
            {config.speedIncrement > 0 && (
              <span className="text-[11px] font-black text-amber-600 bg-amber-100 px-1 rounded">Lv.{stats.speedLevel}</span>
            )}
          </div>
        </div>

        {/* Center: Distance / Score */}
        <div className="flex items-center gap-3">
          <div id="score-display" className="text-center px-4 py-1.5 rounded-2xl bg-white/90 border border-white/80 backdrop-blur-md shadow-md">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">점수</div>
            <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono tracking-tight leading-none">
              {stats.score.toLocaleString()}
            </div>
          </div>

          <div id="distance-display" className="hidden sm:block text-center px-3 py-1.5 rounded-2xl bg-white/90 border border-white/80 backdrop-blur-md shadow-md">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">거리</div>
            <div className="text-base font-black text-slate-800 font-mono leading-none">
              {stats.distance}m
            </div>
          </div>
        </div>

        {/* Right: Gold & Utility Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Gold Counter */}
          <div
            id="gold-counter"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-black border border-amber-300 bg-amber-50 text-amber-900 backdrop-blur-md shadow-md"
          >
            <Coins className="w-4 h-4 text-amber-500 animate-bounce" />
            <span className="font-mono text-amber-700 text-sm sm:text-base">{stats.gold}</span>
          </div>

          {/* Sound Toggle */}
          <button
            id="mute-toggle-btn"
            onClick={onToggleMute}
            className="p-2 rounded-full border border-white/80 bg-white/90 hover:bg-white text-slate-700 shadow-md transition"
            title={isMuted ? '소리 켜기' : '소리 끄기'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>

          {/* Pause Toggle */}
          <button
            id="pause-toggle-btn"
            onClick={onTogglePause}
            className="p-2 rounded-full border border-white/80 bg-white/90 hover:bg-white text-slate-700 shadow-md transition"
            title={isPaused ? '계속하기' : '일시정지'}
          >
            {isPaused ? <Play className="w-4 h-4 text-sky-600" /> : <Pause className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* Speed Up Notification Banner */}
      {speedUpNotice && (
        <div className="mx-auto mt-2 animate-bounce">
          <div className="px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl border border-amber-300">
            <Gauge className="w-4 h-4" />
            <span>{speedUpNotice}</span>
          </div>
        </div>
      )}
    </header>
  );
};

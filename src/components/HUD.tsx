import React from 'react';
import { Volume2, VolumeX, Pause, Play, Coins, Gauge, Trophy } from 'lucide-react';
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
    <header className="absolute inset-x-0 top-0 p-4 sm:p-6 pointer-events-none select-none z-10 flex flex-col gap-3">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
        {/* Left: Difficulty & Speed */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          <div
            id="difficulty-badge"
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border backdrop-blur-md transition-all shadow-sm ${config.badgeColor} bg-slate-900/80`}
          >
            {config.name}
          </div>

          <div
            id="speed-indicator"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-slate-700/60 bg-slate-900/80 text-slate-200 backdrop-blur-md shadow-sm"
          >
            <Gauge className="w-3.5 h-3.5 text-sky-400" />
            <span>속도:</span>
            <span className="font-bold text-white">{stats.speed}</span>
            {config.speedIncrement > 0 && (
              <span className="text-[10px] text-amber-400">Lv.{stats.speedLevel}</span>
            )}
          </div>
        </div>

        {/* Center: Distance / Score */}
        <div className="flex items-center gap-4">
          <div id="score-display" className="text-center">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">점수</div>
            <div className="text-xl sm:text-2xl font-black text-white drop-shadow-sm font-mono tracking-tight">
              {stats.score.toLocaleString()}
            </div>
          </div>

          <div id="distance-display" className="hidden sm:block text-center border-l border-slate-700/60 pl-4">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">이동 거리</div>
            <div className="text-lg font-bold text-slate-200 font-mono">
              {stats.distance}m
            </div>
          </div>
        </div>

        {/* Right: Gold & Utility Controls */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {/* Gold Counter */}
          <div
            id="gold-counter"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold border border-amber-500/40 bg-amber-950/40 text-amber-300 backdrop-blur-md shadow-sm"
          >
            <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-mono text-white text-sm sm:text-base">{stats.gold}</span>
          </div>

          {/* Sound Toggle */}
          <button
            id="mute-toggle-btn"
            onClick={onToggleMute}
            className="p-2 rounded-full border border-slate-700/60 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition shadow-sm"
            title={isMuted ? '소리 켜기' : '소리 끄기'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Pause Toggle */}
          <button
            id="pause-toggle-btn"
            onClick={onTogglePause}
            className="p-2 rounded-full border border-slate-700/60 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition shadow-sm"
            title={isPaused ? '계속하기' : '일시정지'}
          >
            {isPaused ? <Play className="w-4 h-4 text-sky-400" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Speed Up Notification Banner */}
      {speedUpNotice && (
        <div className="mx-auto mt-2 animate-bounce">
          <div className="px-4 py-1.5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/30">
            <Gauge className="w-4 h-4" />
            <span>{speedUpNotice}</span>
          </div>
        </div>
      )}
    </header>
  );
};

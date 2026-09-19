import React from 'react';
import { Play, MousePointer, ArrowUp, Zap, Shield, Flame, Trophy, Coins } from 'lucide-react';
import { DifficultyLevel, HighScoreRecord } from '../types';
import { DIFFICULTY_CONFIGS } from '../data/difficulties';

interface StartModalProps {
  difficulty: DifficultyLevel;
  onSelectDifficulty: (level: DifficultyLevel) => void;
  onStartGame: () => void;
  highScore: HighScoreRecord;
}

export const StartModal: React.FC<StartModalProps> = ({
  difficulty,
  onSelectDifficulty,
  onStartGame,
  highScore,
}) => {
  const difficulties: DifficultyLevel[] = [1, 2, 3];

  return (
    <div
      id="start-screen-overlay"
      className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 z-20 overflow-y-auto"
    >
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 text-slate-100">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Coins className="w-3.5 h-3.5" /> 3D Endless Runner
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-1">
            골드 런 <span className="text-amber-400">GOLD RUN</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-md">
            마우스 좌표로 부드럽게 조향하고 화면을 클릭해 점프하세요!
          </p>
        </div>

        {/* Difficulty Selection */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              난이도 선택 (3단계)
            </span>
            {highScore.score > 0 && (
              <span className="text-xs text-amber-400 flex items-center gap-1 font-mono">
                <Trophy className="w-3.5 h-3.5" /> 최고 기록: {highScore.score.toLocaleString()}점
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {difficulties.map((lvl) => {
              const cfg = DIFFICULTY_CONFIGS[lvl];
              const isSelected = difficulty === lvl;

              return (
                <button
                  key={lvl}
                  id={`difficulty-btn-${lvl}`}
                  type="button"
                  onClick={() => onSelectDifficulty(lvl)}
                  className={`flex flex-col text-left p-3.5 rounded-xl border transition-all relative ${
                    isSelected
                      ? 'border-amber-400/80 bg-amber-500/10 shadow-md ring-2 ring-amber-400/30'
                      : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/70 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold text-slate-300">
                      {lvl === 1 ? '1단계' : lvl === 2 ? '2단계' : '3단계'}
                    </span>
                    {lvl === 1 ? (
                      <Shield className="w-4 h-4 text-emerald-400" />
                    ) : lvl === 2 ? (
                      <Zap className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Flame className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                  <div className="font-bold text-white text-base mb-1">{cfg.subName}</div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {lvl === 1
                      ? '일정한 속도, 넓은 장애물 간격으로 확실히 쉬움'
                      : lvl === 2
                      ? '12초마다 가속, 복합 장애물 배치'
                      : '8초마다 급가속, 좁은 통로와 높은 난도'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Mode Summary */}
        <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800/80 text-xs flex flex-col gap-1.5">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>{DIFFICULTY_CONFIGS[difficulty].name} 규칙</span>
          </div>
          <ul className="text-slate-400 space-y-1 list-disc list-inside">
            {DIFFICULTY_CONFIGS[difficulty].features.map((feat, idx) => (
              <li key={idx}>{feat}</li>
            ))}
          </ul>
        </div>

        {/* Controls Instructions Card */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-850/60 border border-slate-800 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
              <MousePointer className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">마우스 좌우 이동</div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                마우스 엑스좌표를 따라 캐릭터가 부드럽게 이동합니다 (스냅 없음)
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <ArrowUp className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">화면 어디나 클릭</div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                클릭 시 점프합니다 (스페이스바 가능, 슬라이드 없음)
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          id="game-start-btn"
          type="button"
          onClick={onStartGame}
          className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>게임 시작 ({DIFFICULTY_CONFIGS[difficulty].subName})</span>
        </button>
      </div>
    </div>
  );
};

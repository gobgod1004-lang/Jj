import React from 'react';
import { Play, Menu, RotateCcw } from 'lucide-react';
import { DifficultyLevel } from '../types';
import { DIFFICULTY_CONFIGS } from '../data/difficulties';

interface PauseModalProps {
  difficulty: DifficultyLevel;
  onResume: () => void;
  onRestart: () => void;
  onOpenMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  difficulty,
  onResume,
  onRestart,
  onOpenMenu,
}) => {
  return (
    <div
      id="pause-overlay"
      className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-20"
    >
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-center text-slate-100">
        <div>
          <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
            {DIFFICULTY_CONFIGS[difficulty].name}
          </div>
          <h3 className="text-2xl font-black text-white">일시 정지됨</h3>
          <p className="text-xs text-slate-400 mt-1">
            잠시 숨을 고르고 계속 달려보세요!
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            id="pause-resume-btn"
            type="button"
            onClick={onResume}
            className="w-full py-3.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>계속하기 (Resume)</span>
          </button>

          <button
            id="pause-restart-btn"
            type="button"
            onClick={onRestart}
            className="w-full py-2.5 px-5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 border border-slate-700/60 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>처음부터 재시작</span>
          </button>

          <button
            id="pause-menu-btn"
            type="button"
            onClick={onOpenMenu}
            className="w-full py-2.5 px-5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium text-xs flex items-center justify-center gap-2 border border-slate-800 transition cursor-pointer"
          >
            <Menu className="w-3.5 h-3.5" />
            <span>메인 메뉴로 이동</span>
          </button>
        </div>
      </div>
    </div>
  );
};

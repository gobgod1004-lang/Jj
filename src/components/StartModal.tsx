import React, { useState } from 'react';
import { Play, MousePointer, ArrowUp, Zap, Shield, Flame, Trophy, Coins, ListOrdered, ChevronDown, ChevronUp } from 'lucide-react';
import { DifficultyLevel, HighScoreRecord, PlayHistoryRecord } from '../types';
import { DIFFICULTY_CONFIGS } from '../data/difficulties';

interface StartModalProps {
  difficulty: DifficultyLevel;
  onSelectDifficulty: (level: DifficultyLevel) => void;
  onStartGame: () => void;
  highScore: HighScoreRecord;
  history: PlayHistoryRecord[];
}

export const StartModal: React.FC<StartModalProps> = ({
  difficulty,
  onSelectDifficulty,
  onStartGame,
  highScore,
  history,
}) => {
  const difficulties: DifficultyLevel[] = [1, 2, 3];
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div
      id="start-screen-overlay"
      className="absolute inset-0 bg-sky-950/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 z-20 overflow-y-auto"
    >
      <div className="w-full max-w-xl bg-white/95 text-slate-900 border border-amber-200/80 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col gap-5 my-auto">
        {/* Header (Sunny & Cheerful) */}
        <div className="text-center flex flex-col items-center gap-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            <span>화창한 날의 3D 골드 러너</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mt-1">
            골드 런 <span className="text-amber-500">GOLD RUN</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md font-medium">
            마우스 좌우 좌표로 부드럽게 핸들링하고 화면을 클릭해 점프하세요!
          </p>
        </div>

        {/* Difficulty Selection */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              난이도 선택 (3단계)
            </span>
            {highScore.score > 0 && (
              <span className="text-xs text-amber-600 flex items-center gap-1 font-bold font-mono">
                <Trophy className="w-3.5 h-3.5" /> 내 최고 기록: {highScore.score.toLocaleString()}점
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {difficulties.map((lvl) => {
              const cfg = DIFFICULTY_CONFIGS[lvl];
              const isSelected = difficulty === lvl;

              return (
                <button
                  key={lvl}
                  id={`difficulty-btn-${lvl}`}
                  type="button"
                  onClick={() => onSelectDifficulty(lvl)}
                  className={`flex flex-col text-left p-3 rounded-2xl border transition-all relative ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-400/40'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-black text-slate-700">
                      {lvl === 1 ? '1단계' : lvl === 2 ? '2단계' : '3단계'}
                    </span>
                    {lvl === 1 ? (
                      <Shield className="w-4 h-4 text-emerald-500" />
                    ) : lvl === 2 ? (
                      <Zap className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Flame className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <div className="font-extrabold text-slate-900 text-base mb-0.5">{cfg.subName}</div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {lvl === 1
                      ? '속도 일정, 간격 넓음 (쉬움)'
                      : lvl === 2
                      ? '12초마다 가속, 복합 장애물'
                      : '8초마다 급가속, 좁은 틈새 (어려움)'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Mode Summary */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col gap-1">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>{DIFFICULTY_CONFIGS[difficulty].name} 규칙</span>
          </div>
          <ul className="text-slate-600 space-y-0.5 list-disc list-inside">
            {DIFFICULTY_CONFIGS[difficulty].features.map((feat, idx) => (
              <li key={idx}>{feat}</li>
            ))}
          </ul>
        </div>

        {/* Play History & Ranking Toggle Accordion */}
        {history.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="w-full p-3 flex items-center justify-between font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <span className="flex items-center gap-1.5">
                <ListOrdered className="w-4 h-4 text-amber-500" />
                <span>내 역대 플레이 기록 & 랭킹 보기 ({history.length}회 기록)</span>
              </span>
              {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showHistory && (
              <div className="max-h-40 overflow-y-auto p-2.5 pt-0 flex flex-col gap-1.5 border-t border-slate-200">
                {history.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80 text-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                          idx === 0
                            ? 'bg-amber-400 text-slate-950'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-800'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {item.score.toLocaleString()}점
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({item.distance}m · {item.difficulty}단계)
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">{item.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Controls Instructions Card */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-sky-50/60 border border-sky-100 text-xs">
          <div className="flex items-start gap-2">
            <div className="p-1.5 rounded-lg bg-sky-100 text-sky-600 shrink-0">
              <MousePointer className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-bold text-slate-800">마우스 좌우 이동</div>
              <div className="text-slate-500 text-[11px]">
                마우스 엑스좌표에 맞춰 부드럽게 이동
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
              <ArrowUp className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-bold text-slate-800">화면 어디나 클릭</div>
              <div className="text-slate-500 text-[11px]">
                클릭 시 즉시 점프 (슬라이드 없음)
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          id="game-start-btn"
          type="button"
          onClick={onStartGame}
          className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition cursor-pointer"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>게임 시작 ({DIFFICULTY_CONFIGS[difficulty].subName})</span>
        </button>
      </div>
    </div>
  );
};

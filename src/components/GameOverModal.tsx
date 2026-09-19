import React from 'react';
import { RotateCcw, Menu, Sparkles, ListOrdered, Footprints, Coins, Gauge } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DifficultyLevel, GameStats, HighScoreRecord, RankEvaluation, PlayHistoryRecord } from '../types';
import { DIFFICULTY_CONFIGS } from '../data/difficulties';

interface GameOverModalProps {
  stats: GameStats;
  difficulty: DifficultyLevel;
  highScore: HighScoreRecord;
  isNewRecord: boolean;
  evaluation: RankEvaluation | null;
  history: PlayHistoryRecord[];
  onRestart: () => void;
  onOpenMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  difficulty,
  highScore,
  isNewRecord,
  evaluation,
  history,
  onRestart,
  onOpenMenu,
}) => {
  const config = DIFFICULTY_CONFIGS[difficulty];

  React.useEffect(() => {
    if (isNewRecord || (evaluation && evaluation.isHighRank)) {
      try {
        confetti({
          particleCount: 95,
          spread: 85,
          origin: { y: 0.55 },
          colors: ['#ffd700', '#f59e0b', '#38bdf8', '#4ade80', '#ec4899'],
        });
      } catch {
        // ignore
      }
    }
  }, [isNewRecord, evaluation]);

  return (
    <div
      id="game-over-overlay"
      className="absolute inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-20 overflow-y-auto"
    >
      <div className="w-full max-w-lg bg-white/95 text-slate-900 border border-amber-200/80 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Dynamic Rank Praise / Teasing Banner (Per Difficulty) */}
        {evaluation && (
          <div
            id="rank-evaluation-card"
            className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 shadow-sm ${
              evaluation.isHighRank
                ? 'bg-amber-50 border-amber-300/80 text-amber-950'
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}
          >
            <div className="text-3xl shrink-0 p-1">{evaluation.emoji}</div>
            <div className="flex flex-col gap-0.5">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                    evaluation.isHighRank
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-rose-200 text-rose-800'
                  }`}
                >
                  {config.name} 순위: {evaluation.rank}위 / {evaluation.totalPlays}회
                </span>
                <span className="font-bold text-sm sm:text-base text-slate-900">
                  {evaluation.title}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mt-1.5 font-medium">
                {evaluation.message}
              </p>
            </div>
          </div>
        )}

        {/* Score & Record Summary */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-emerald-500/10 border border-slate-200/80">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">이번 판 점수</div>
            <div className="text-3xl sm:text-4xl font-black text-amber-600 font-mono tracking-tight">
              {stats.score.toLocaleString()}점
            </div>
            <div className="text-xs text-slate-500 font-bold mt-0.5 flex items-center gap-1.5">
              <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[10px]">
                {config.name}
              </span>
              <span>{config.subName}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {config.name} 최고 점수
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-700 font-mono">
              {Math.max(highScore.score, stats.score).toLocaleString()}점
            </div>
            {isNewRecord && (
              <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-600 animate-pulse">
                <Sparkles className="w-3 h-3" /> 최고 기록 갱신!
              </span>
            )}
          </div>
        </div>

        {/* Stats 3-Col Badges */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-0.5">
            <Footprints className="w-4 h-4 text-sky-500" />
            <span className="text-[10px] text-slate-500 font-bold uppercase">거리</span>
            <span className="font-mono font-black text-sm sm:text-base text-slate-800">
              {stats.distance}m
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-0.5">
            <Coins className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] text-slate-500 font-bold uppercase">골드</span>
            <span className="font-mono font-black text-sm sm:text-base text-amber-600">
              {stats.gold}개
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-0.5">
            <Gauge className="w-4 h-4 text-emerald-500" />
            <span className="text-[10px] text-slate-500 font-bold uppercase">최종 속도</span>
            <span className="font-mono font-black text-sm sm:text-base text-slate-800">
              {stats.speed}
            </span>
          </div>
        </div>

        {/* Difficulty Specific Mini Leaderboard */}
        {history.length > 0 && (
          <div className="flex flex-col gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-700 px-1">
              <span className="flex items-center gap-1.5">
                <ListOrdered className="w-3.5 h-3.5 text-amber-500" />
                <span>{config.name} 순위표 (TOP 4)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">총 {history.length}회 도전</span>
            </div>

            <div className="flex flex-col gap-1">
              {history.slice(0, 4).map((rec, idx) => {
                const isCurrent = evaluation?.rank === idx + 1;
                return (
                  <div
                    key={rec.id || idx}
                    className={`flex items-center justify-between p-2 rounded-lg transition-all ${
                      isCurrent
                        ? 'bg-amber-100 border border-amber-300 font-bold text-slate-900 shadow-sm ring-1 ring-amber-400/50'
                        : 'bg-white border border-slate-200/70 text-slate-600'
                    }`}
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
                      <span className="font-mono font-bold text-slate-800">
                        {rec.score.toLocaleString()}점
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({rec.distance}m · 골드 {rec.gold})
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400">
                      <span>{rec.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            id="game-restart-btn"
            type="button"
            onClick={onRestart}
            className="flex-1 py-3.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{config.name} 다시 달리기</span>
          </button>

          <button
            id="game-change-difficulty-btn"
            type="button"
            onClick={onOpenMenu}
            className="sm:w-40 py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 border border-slate-300 transition cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span>난이도/메뉴</span>
          </button>
        </div>
      </div>
    </div>
  );
};

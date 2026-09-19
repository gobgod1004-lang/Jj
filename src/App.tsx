import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameRunner } from './game/GameRunner';
import { DifficultyLevel, GameState, GameStats, HighScoreRecord, PlayHistoryRecord, RankEvaluation } from './types';
import { HUD } from './components/HUD';
import { StartModal } from './components/StartModal';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { sound } from './utils/audio';
import { getPlayHistory, savePlayRecord } from './utils/history';

const defaultStats: GameStats = {
  score: 0,
  distance: 0,
  gold: 0,
  speed: 18,
  timeAlive: 0,
  speedLevel: 1,
};

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const runnerRef = useRef<GameRunner | null>(null);

  const [gameState, setGameState] = useState<GameState>('menu');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(1);
  const [stats, setStats] = useState<GameStats>(defaultStats);
  const [isMuted, setIsMuted] = useState<boolean>(sound.isMuted());
  const [speedUpNotice, setSpeedUpNotice] = useState<string | null>(null);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(true);

  // Play History & Evaluation
  const [history, setHistory] = useState<PlayHistoryRecord[]>(() => getPlayHistory());
  const [latestEvaluation, setLatestEvaluation] = useState<RankEvaluation | null>(null);

  // Load high score from localStorage
  const getHighScore = useCallback((level: DifficultyLevel): HighScoreRecord => {
    try {
      const saved = localStorage.getItem(`gold_run_high_score_${level}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return { score: 0, distance: 0, gold: 0 };
  }, []);

  const [highScore, setHighScore] = useState<HighScoreRecord>(() => getHighScore(1));

  // Initialize GameRunner
  useEffect(() => {
    if (!containerRef.current) return;

    const runner = new GameRunner(containerRef.current, {
      onStatsUpdate: (newStats) => {
        setStats(newStats);
      },
      onSpeedUp: (newSpeed, level) => {
        setSpeedUpNotice(`⚡ 속도 증가! Lv.${level} (${newSpeed} km/h)`);
        setTimeout(() => {
          setSpeedUpNotice((prev) => (prev?.includes(`Lv.${level}`) ? null : prev));
        }, 2200);
      },
      onGameOver: (finalStats) => {
        setStats(finalStats);
        setGameState('gameover');

        // Save play record to history and calculate rank evaluation
        const { updatedHistory, evaluation } = savePlayRecord({
          score: finalStats.score,
          distance: finalStats.distance,
          gold: finalStats.gold,
          speed: finalStats.speed,
          difficulty,
        });

        setHistory(updatedHistory);
        setLatestEvaluation(evaluation);

        const currentHigh = getHighScore(difficulty);
        if (finalStats.score > currentHigh.score) {
          setIsNewRecord(true);
          const newRecord: HighScoreRecord = {
            score: finalStats.score,
            distance: finalStats.distance,
            gold: finalStats.gold,
          };
          setHighScore(newRecord);
          try {
            localStorage.setItem(`gold_run_high_score_${difficulty}`, JSON.stringify(newRecord));
          } catch {
            // ignore
          }
        } else {
          setIsNewRecord(false);
        }
      },
      onGoldCollect: () => {
        // Handled via stats update
      },
    });

    runnerRef.current = runner;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          runner.resize(width, height);
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      runner.destroy();
      runnerRef.current = null;
    };
  }, [difficulty, getHighScore]);

  // Update current high score when difficulty changes
  useEffect(() => {
    setHighScore(getHighScore(difficulty));
  }, [difficulty, getHighScore]);

  // Hide initial hint after 4 seconds of playing
  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setTimeout(() => setShowHint(false), 4000);
      return () => clearTimeout(timer);
    }
    setShowHint(true);
  }, [gameState]);

  // Handlers
  const handleStartGame = () => {
    if (!runnerRef.current) return;
    setGameState('playing');
    runnerRef.current.start(difficulty);
  };

  const handleRestart = () => {
    if (!runnerRef.current) return;
    setGameState('playing');
    runnerRef.current.start(difficulty);
  };

  const handleOpenMenu = () => {
    setGameState('menu');
  };

  const handleTogglePause = () => {
    if (!runnerRef.current) return;
    if (gameState === 'playing') {
      runnerRef.current.pause();
      setGameState('paused');
    } else if (gameState === 'paused') {
      runnerRef.current.resume();
      setGameState('playing');
    }
  };

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleSelectDifficulty = (level: DifficultyLevel) => {
    setDifficulty(level);
  };

  return (
    <div
      id="game-viewport-container"
      className="relative w-screen h-screen overflow-hidden bg-sky-200 select-none"
    >
      {/* 3D WebGL Canvas Container */}
      <div
        id="threejs-canvas-host"
        ref={containerRef}
        className="absolute inset-0 w-full h-full cursor-pointer touch-none"
      />

      {/* In-Game HUD overlay */}
      {gameState === 'playing' && (
        <HUD
          stats={stats}
          difficulty={difficulty}
          isPaused={false}
          isMuted={isMuted}
          speedUpNotice={speedUpNotice}
          onTogglePause={handleTogglePause}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Floating Tutorial Hint (During initial run) */}
      {gameState === 'playing' && showHint && (
        <div className="absolute bottom-6 inset-x-0 flex justify-center pointer-events-none animate-pulse">
          <div className="bg-white/90 text-slate-800 border border-amber-300 font-bold px-4 py-2 rounded-full text-xs sm:text-sm shadow-lg backdrop-blur-sm flex items-center gap-2">
            <span>🖱️ 마우스 좌우로 조향하고 화면을 클릭해 점프하세요!</span>
          </div>
        </div>
      )}

      {/* Start / Menu Modal */}
      {gameState === 'menu' && (
        <StartModal
          difficulty={difficulty}
          onSelectDifficulty={handleSelectDifficulty}
          onStartGame={handleStartGame}
          highScore={highScore}
          history={history}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'gameover' && (
        <GameOverModal
          stats={stats}
          difficulty={difficulty}
          highScore={highScore}
          isNewRecord={isNewRecord}
          evaluation={latestEvaluation}
          history={history.filter((h) => h.difficulty === difficulty)}
          onRestart={handleRestart}
          onOpenMenu={handleOpenMenu}
        />
      )}

      {/* Pause Modal */}
      {gameState === 'paused' && (
        <PauseModal
          difficulty={difficulty}
          onResume={handleTogglePause}
          onRestart={handleRestart}
          onOpenMenu={handleOpenMenu}
        />
      )}
    </div>
  );
}

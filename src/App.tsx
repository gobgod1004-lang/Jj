import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameRunner } from './game/GameRunner';
import { DifficultyLevel, GameState, GameStats, HighScoreRecord } from './types';
import { HUD } from './components/HUD';
import { StartModal } from './components/StartModal';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { sound } from './utils/audio';

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

  // Start game handler
  const handleStartGame = () => {
    setGameState('playing');
    setIsNewRecord(false);
    setSpeedUpNotice(null);
    setShowHint(true);
    runnerRef.current?.start(difficulty);

    // Auto fade hint after 6 seconds
    setTimeout(() => {
      setShowHint(false);
    }, 6000);
  };

  // Restart game handler
  const handleRestart = () => {
    handleStartGame();
  };

  // Pause / Resume toggle
  const handleTogglePause = () => {
    if (gameState === 'playing') {
      runnerRef.current?.pause();
      setGameState('paused');
    } else if (gameState === 'paused') {
      runnerRef.current?.resume();
      setGameState('playing');
    }
  };

  // Sound mute toggle
  const handleToggleMute = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  // Return to menu
  const handleOpenMenu = () => {
    runnerRef.current?.pause();
    setGameState('menu');
  };

  return (
    <main
      id="game-root-container"
      className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none cursor-crosshair font-sans"
    >
      {/* 3D WebGL Canvas Container */}
      <div
        id="game-canvas-container"
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* In-Game Heads-Up Display */}
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

      {/* Floating Control Tip during early run */}
      {gameState === 'playing' && showHint && (
        <aside
          id="control-hint-banner"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none z-10 transition-opacity duration-700 animate-pulse"
        >
          <div className="px-4 py-2 rounded-full bg-slate-900/85 border border-slate-700/80 backdrop-blur-md text-slate-200 text-xs flex items-center gap-3 shadow-lg">
            <span>🖱️ 마우스 좌우: <strong>부드러운 조향</strong></span>
            <span className="w-1 h-1 rounded-full bg-slate-500"></span>
            <span>👆 화면 아무데나 클릭: <strong>점프</strong></span>
          </div>
        </aside>
      )}

      {/* Start / Difficulty Selection Modal */}
      {gameState === 'menu' && (
        <StartModal
          difficulty={difficulty}
          onSelectDifficulty={(lvl) => setDifficulty(lvl)}
          onStartGame={handleStartGame}
          highScore={highScore}
        />
      )}

      {/* Paused Modal */}
      {gameState === 'paused' && (
        <PauseModal
          difficulty={difficulty}
          onResume={handleTogglePause}
          onRestart={handleRestart}
          onOpenMenu={handleOpenMenu}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'gameover' && (
        <GameOverModal
          stats={stats}
          difficulty={difficulty}
          highScore={highScore}
          isNewRecord={isNewRecord}
          onRestart={handleRestart}
          onOpenMenu={handleOpenMenu}
        />
      )}
    </main>
  );
}

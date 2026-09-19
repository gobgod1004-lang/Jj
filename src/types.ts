export type DifficultyLevel = 1 | 2 | 3;

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';

export interface DifficultyConfig {
  id: DifficultyLevel;
  name: string;
  subName: string;
  badgeColor: string;
  initialSpeed: number;
  speedIncrement: number; // speed increase per interval (0 for level 1)
  speedUpInterval: number; // in seconds
  maxSpeed: number;
  minObstacleDistance: number;
  maxObstacleDistance: number;
  description: string;
  features: string[];
}

export interface GameStats {
  score: number;
  distance: number;
  gold: number;
  speed: number;
  timeAlive: number;
  speedLevel: number;
}

export interface HighScoreRecord {
  score: number;
  distance: number;
  gold: number;
}

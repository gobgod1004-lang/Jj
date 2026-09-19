import { DifficultyConfig } from '../types';

export const DIFFICULTY_CONFIGS: Record<1 | 2 | 3, DifficultyConfig> = {
  1: {
    id: 1,
    name: '1단계: 초급 (Easy)',
    subName: '쉬움',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    initialSpeed: 17,
    speedIncrement: 0, // 1단계는 시간이 지나도 속도가 증가하지 않음
    speedUpInterval: 999999,
    maxSpeed: 17,
    minObstacleDistance: 32,
    maxObstacleDistance: 45,
    description: '느긋하고 일정한 속도. 장애물 간격이 넓고 회피 및 점프가 아주 쉬워 초보자에게 적합합니다.',
    features: [
      '일정한 속도 유지 (가속 없음)',
      '넓은 장애물 간격 및 여유로운 통과 공간',
      '풍부한 골드 바 배치',
    ],
  },
  2: {
    id: 2,
    name: '2단계: 중급 (Normal)',
    subName: '보통',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    initialSpeed: 25,
    speedIncrement: 1.5,
    speedUpInterval: 12, // 12초마다 속도 1.5 증가
    maxSpeed: 42,
    minObstacleDistance: 22,
    maxObstacleDistance: 30,
    description: '균형 잡힌 속도. 12초마다 속도가 빨라지며 복합 장애물과 점프 타이밍이 요구됩니다.',
    features: [
      '12초마다 서서히 속도 증가',
      '2차선 차단 및 연속 허들 장애물',
      '중급 난이도의 스티어링과 점프',
    ],
  },
  3: {
    id: 3,
    name: '3단계: 고급 (Hard)',
    subName: '어려움',
    badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    initialSpeed: 34,
    speedIncrement: 2.2,
    speedUpInterval: 8, // 8초마다 속도 2.2 증가
    maxSpeed: 58,
    minObstacleDistance: 14,
    maxObstacleDistance: 20,
    description: '빠른 시작 속도. 8초마다 급격히 빨라지며 좁은 틈새와 연속 장애물을 돌파해야 하는 고난도 모드입니다.',
    features: [
      '8초마다 빠른 속도 증가 (최대 58 속도)',
      '지그재그 및 좁은 통로 연속 배치',
      '순간적인 마우스 핸들링과 정밀 점프 필요',
    ],
  },
};

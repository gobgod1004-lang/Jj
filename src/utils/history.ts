import { PlayHistoryRecord, RankEvaluation, DifficultyLevel } from '../types';

const STORAGE_KEY_PREFIX = 'gold_run_play_history_diff_';

export function getPlayHistory(difficulty?: DifficultyLevel): PlayHistoryRecord[] {
  if (difficulty) {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${difficulty}`);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.warn(`Failed to parse play history for difficulty ${difficulty}`, e);
    }
    return [];
  }

  // If no difficulty specified, combine from all 3 difficulties sorted by score
  const all: PlayHistoryRecord[] = [];
  ([1, 2, 3] as DifficultyLevel[]).forEach((diff) => {
    all.push(...getPlayHistory(diff));
  });
  all.sort((a, b) => b.score - a.score);
  return all;
}

export function savePlayRecord(record: Omit<PlayHistoryRecord, 'id' | 'date' | 'timestamp'>): {
  updatedHistory: PlayHistoryRecord[];
  evaluation: RankEvaluation;
  recordWithRank: PlayHistoryRecord;
} {
  const diff = record.difficulty;
  const history = getPlayHistory(diff);
  const now = new Date();
  const formattedDate = `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newRecord: PlayHistoryRecord = {
    ...record,
    id: `run_${diff}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    date: formattedDate,
    timestamp: Date.now(),
  };

  // Combine and sort by score descending for this specific difficulty
  const combined = [...history, newRecord];
  combined.sort((a, b) => b.score - a.score);

  // Keep top 50 records for this difficulty
  const trimmed = combined.slice(0, 50);

  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${diff}`, JSON.stringify(trimmed));
  } catch (e) {
    console.warn(`Failed to save play history for difficulty ${diff}`, e);
  }

  // Determine current record rank (1-based) within this difficulty
  const rank = combined.findIndex((r) => r.id === newRecord.id) + 1;
  const totalPlays = combined.length;

  const evaluation = evaluateRank(rank, totalPlays, newRecord.score, newRecord.distance, diff);

  return {
    updatedHistory: trimmed,
    evaluation,
    recordWithRank: { ...newRecord, rank },
  };
}

export function evaluateRank(
  rank: number,
  totalPlays: number,
  score: number,
  distance: number,
  difficulty: DifficultyLevel
): RankEvaluation {
  const diffName = difficulty === 1 ? '쉬움(1단계)' : difficulty === 2 ? '보통(2단계)' : '어려움(3단계)';
  const isTopThree = rank <= 3;
  const isTopPercentile = totalPlays <= 3 ? rank === 1 : rank / totalPlays <= 0.35;
  const isHighRank = isTopThree || isTopPercentile;

  if (rank === 1) {
    return {
      rank,
      totalPlays,
      isHighRank: true,
      emoji: '👑',
      title: `${diffName} 역대 1위 신기록 달성!`,
      message:
        totalPlays === 1
          ? `첫 도전 만에 ${diffName} 모드 1위를 차지했습니다! 마우스 핸들링 감각이 정말 천재적이시네요!`
          : `${diffName} 모드의 모든 기존 기록을 제치고 새로운 챔피언에 올랐습니다! 경이로운 순발력과 완벽한 회피 능력입니다!`,
    };
  }

  if (rank === 2) {
    return {
      rank,
      totalPlays,
      isHighRank: true,
      emoji: '🥈',
      title: `${diffName} 역대 2위 은메달!`,
      message: `와! ${diffName} 모드에서 정상을 위협하는 최고 수준의 질주였습니다. 1위와의 격차가 얼마 남지 않았어요!`,
    };
  }

  if (rank === 3) {
    return {
      rank,
      totalPlays,
      isHighRank: true,
      emoji: '🥉',
      title: `${diffName} 역대 3위 포디움 진입!`,
      message: `탑 3 명예의 전당에 안착했습니다! ${diffName} 코스의 고비를 예술적인 점프와 코너링으로 넘기셨군요!`,
    };
  }

  if (isHighRank) {
    return {
      rank,
      totalPlays,
      isHighRank: true,
      emoji: '✨',
      title: `${diffName} 상위권 랭크 진입! (${rank}위 / 총 ${totalPlays}회)`,
      message: `${diffName} 모드 상위권에 당당히 이름을 올렸습니다! 손놀림이 아주 안정적이고 훌륭합니다.`,
    };
  }

  // Low rank / Playful teasing per difficulty
  if (distance < 50) {
    return {
      rank,
      totalPlays,
      isHighRank: false,
      emoji: '🐢',
      title: `출발하자마자 쾅?! (${diffName} ${rank}위 / 총 ${totalPlays}회)`,
      message:
        difficulty === 1
          ? '가장 쉬운 1단계인데 50m도 못 가고 넘어지셨어요! 마우스에 버터 발라두신 줄 알았습니다 ㅋㅋㅋ'
          : `${diffName} 장애물 앞에서 시원하게 몸개그 작렬! 거북이도 이것보단 멀리 가겠어요 ㅎㅎ`,
    };
  }

  if (rank === totalPlays && totalPlays > 2) {
    return {
      rank,
      totalPlays,
      isHighRank: false,
      emoji: '📉',
      title: `${diffName} 꼴찌 당첨 축하드립니다! (${rank}위 / 총 ${totalPlays}회)`,
      message: `다른 플레이어들의 자존감을 살려주는 따뜻한 꼴찌 기둥이 되어주셨네요! 다음 판엔 눈 뜨고 마우스 잡아보실래요?`,
    };
  }

  const teasingQuotes = [
    `${diffName} 코스에서 장애물이 무서워서 도망치신 줄 알았어요! 점프 클릭 타이밍이 살짝 졸리셨나요?`,
    `동네 산책 나온 강아지도 이것보단 점프 잘하겠어요! 마우스 엑스좌표 조향 연습 좀 더 해보세요~`,
    `화면 멍하니 구경하시다가 허망하게 부딪히셨네요! 손가락 스트레칭하고 다시 도전해봐요!`,
    `${diffName} 순위표 저 밑바닥에 조용히 안착하셨습니다... 기록 갱신을 위해 분발하세요!`,
  ];

  const pickedTease = teasingQuotes[Math.floor(Math.random() * teasingQuotes.length)];

  return {
    rank,
    totalPlays,
    isHighRank: false,
    emoji: '😜',
    title: `${diffName} 아쉬운 하위권 (${rank}위 / 총 ${totalPlays}회)`,
    message: pickedTease,
  };
}

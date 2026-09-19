import { PlayHistoryRecord, RankEvaluation, DifficultyLevel } from '../types';

const STORAGE_KEY = 'gold_run_play_history_v2';

export function getPlayHistory(): PlayHistoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse play history', e);
  }
  return [];
}

export function savePlayRecord(record: Omit<PlayHistoryRecord, 'id' | 'date' | 'timestamp'>): {
  updatedHistory: PlayHistoryRecord[];
  evaluation: RankEvaluation;
  recordWithRank: PlayHistoryRecord;
} {
  const history = getPlayHistory();
  const now = new Date();
  const formattedDate = `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newRecord: PlayHistoryRecord = {
    ...record,
    id: `run_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    date: formattedDate,
    timestamp: Date.now(),
  };

  // Combine and sort by score descending
  const combined = [...history, newRecord];
  combined.sort((a, b) => b.score - a.score);

  // Keep top 50 records
  const trimmed = combined.slice(0, 50);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Failed to save play history', e);
  }

  // Determine current record rank (1-based)
  const rank = combined.findIndex((r) => r.id === newRecord.id) + 1;
  const totalPlays = combined.length;

  const evaluation = evaluateRank(rank, totalPlays, newRecord.score, newRecord.distance);

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
  distance: number
): RankEvaluation {
  // "순위 높으면 칭찬하고 순위 낮으면 놀려줘"
  // Top 1, 2, 3 or top 25% gets high praise
  const isTopThree = rank <= 3;
  const isTopPercentile = totalPlays <= 3 ? rank === 1 : rank / totalPlays <= 0.35;
  const isHighRank = isTopThree || isTopPercentile;

  if (rank === 1) {
    return {
      rank,
      totalPlays,
      isHighRank: true,
      emoji: '👑',
      title: '전설의 골드 러너 등극!',
      message:
        totalPlays === 1
          ? '첫 판부터 환상적인 주행! 명실상부 압도적인 1위 기록입니다! 멋진 반응속도네요!'
          : `역대 최고 1위 기록을 갈아치웠습니다! 당신의 순발력과 완벽한 마우스 컨트롤에 감탄이 절로 나옵니다. 챔피언!`,
    };
  }

  if (rank === 2) {
    return {
      rank,
      totalPlays,
      isHighRank: true,
      emoji: '🥈',
      title: '역대 2위! 엄청난 질주!',
      message: '1위 왕좌가 바로 코앞에 있습니다! 방금 주행 정말 아슬아슬하고 예술적이었어요!',
    };
  }

  if (rank === 3) {
    return {
      rank,
      totalPlays,
      isHighRank: true,
      emoji: '🥉',
      title: '역대 3위 포디움 입성!',
      message: '탑 3에 이름을 올렸습니다! 손끝 감각이 완전히 살아있네요. 1위까지 조금만 더 달려보세요!',
    };
  }

  if (isHighRank) {
    return {
      rank,
      totalPlays,
      isHighRank: true,
      emoji: '✨',
      title: `상위권 랭크 진입! (${rank}위 / 총 ${totalPlays}회)`,
      message: '평균을 훌쩍 뛰어넘는 뛰어난 질주였습니다! 마우스 핸들링이 정말 날렵하시네요.',
    };
  }

  // Low rank / Playful teasing
  // Different playful teasing quotes based on how low or short the run was
  if (distance < 50) {
    return {
      rank,
      totalPlays,
      isHighRank: false,
      emoji: '🐢',
      title: `출발하자마자 쿵?! (${rank}위 / 총 ${totalPlays}회)`,
      message: '어라? 혹시 마우스에 버터 발라두셨나요? 50m도 못 가고 넘어지다니 거북이도 웃겠어요 ㅋㅋㅋ',
    };
  }

  if (rank === totalPlays && totalPlays > 2) {
    return {
      rank,
      totalPlays,
      isHighRank: false,
      emoji: '📉',
      title: `꼴찌 달성 축하(?)합니다! (${rank}위 / 총 ${totalPlays}회)`,
      message: '와우, 밑바닥을 든든하게 받쳐주는 기둥이 되어주셨군요! 다음 판엔 눈 뜨고 마우스 잡아보실래요? ㅎㅎ',
    };
  }

  const teasingQuotes = [
    '이 정도 실력으로는 동네 고양이도 못 따라잡겠는걸요? 마우스 연습 좀 더 하고 오세요~',
    '화면만 멍하니 보다가 장애물에 냅다 부딪히신 거 다 봤습니다! 손가락 스트레칭 필수!',
    '장애물이 무서워서 도망치신 줄 알았어요! 점프 클릭 타이밍이 살짝 졸리셨던 것 같은데요?',
    '순위표 아래쪽에 조용히 안착하셨네요... 다음엔 조금만 더 집중해서 기록 갱신해봐요!',
  ];

  const pickedTease = teasingQuotes[Math.floor(Math.random() * teasingQuotes.length)];

  return {
    rank,
    totalPlays,
    isHighRank: false,
    emoji: '😜',
    title: `아쉬운 하위권 기록 (${rank}위 / 총 ${totalPlays}회)`,
    message: pickedTease,
  };
}

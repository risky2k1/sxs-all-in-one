export type Resonance = {
  minLv: number;
  maxLv: number;
  current: number;
  next: number;
  diff: number;
  uneven: boolean;
  advice: string;
};

export function resonance(levels: number[]): Resonance {
  if (levels.length === 0) {
    return {
      minLv: 0,
      maxLv: 0,
      current: 0,
      next: 5,
      diff: 0,
      uneven: false,
      advice: "No gear yet.",
    };
  }
  const minLv = Math.min(...levels);
  const maxLv = Math.max(...levels);
  const current = Math.floor(minLv / 5) * 5;
  const next = current + 5;
  const diff = maxLv - minLv;
  const uneven = diff > 5;
  const advice = uneven
    ? `Highest +${maxLv} and lowest +${minLv} are ${diff} apart. Stop pushing +${maxLv} and raise the low pieces to +${next}.`
    : `Pieces are even (lowest +${minLv}, highest +${maxLv}). Next target is +${next} on all five.`;
  return { minLv, maxLv, current, next, diff, uneven, advice };
}

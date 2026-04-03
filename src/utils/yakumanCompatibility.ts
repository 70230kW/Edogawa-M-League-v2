import { YakumanType } from '@/types';

export const YAKUMAN_LIST: YakumanType[] = [
  '天和', '地和', '国士無双', '四暗刻',
  '大三元', '緑一色', '字一色',
  '小四喜', '大四喜', '清老頭',
  '四槓子', '九蓮宝燈',
];

export const INCOMPATIBLE_PAIRS: [YakumanType, YakumanType][] = [
  ['国士無双', '四暗刻'],  ['国士無双', '四槓子'],
  ['国士無双', '大三元'],  ['国士無双', '字一色'],
  ['国士無双', '緑一色'],  ['国士無双', '清老頭'],
  ['国士無双', '小四喜'],  ['国士無双', '大四喜'],
  ['九蓮宝燈', '四暗刻'],  ['九蓮宝燈', '字一色'],
  ['九蓮宝燈', '緑一色'],  ['九蓮宝燈', '清老頭'],
  ['九蓮宝燈', '大三元'],  ['九蓮宝燈', '小四喜'],
  ['九蓮宝燈', '大四喜'],  ['九蓮宝燈', '四槓子'],
  ['大四喜',   '小四喜'],  ['大四喜',   '大三元'],
  ['大四喜',   '緑一色'],  ['大四喜',   '清老頭'],
  ['小四喜',   '大三元'],  ['小四喜',   '緑一色'],
  ['小四喜',   '清老頭'],  ['大三元',   '清老頭'],
  ['大三元',   '緑一色'],  ['緑一色',   '清老頭'],
  ['天和',     '四槓子'],  ['地和',     '四槓子'],
  ['清老頭',   '四槓子'],
];

export function getCompatibleYakuman(
  selected: YakumanType[]
): Record<YakumanType, boolean> {
  const result = {} as Record<YakumanType, boolean>;
  for (const candidate of YAKUMAN_LIST) {
    if (selected.includes(candidate)) {
      result[candidate] = true;
      continue;
    }
    const wouldConflict = selected.some((sel) =>
      INCOMPATIBLE_PAIRS.some(
        ([a, b]) =>
          (a === candidate && b === sel) || (b === candidate && a === sel)
      )
    );
    result[candidate] = !wouldConflict;
  }
  return result;
}

export function getIncompatibleWith(yakuman: YakumanType): YakumanType[] {
  return INCOMPATIBLE_PAIRS
    .filter(([a, b]) => a === yakuman || b === yakuman)
    .map(([a, b]) => (a === yakuman ? b : a));
}

export function getYakumanMultiplierLabel(count: number): string {
  if (count <= 1) return '';
  if (count === 2) return 'ダブル役満';
  if (count === 3) return 'トリプル役満';
  return `${count}倍役満`;
}

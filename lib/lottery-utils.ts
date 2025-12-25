// 抽奖工具函数

export interface Prize {
  id: string;
  name: string;
  weight: number; // 权重，用于不均匀概率
}

export interface LotteryResult {
  prize: string;
  timestamp: number;
}

/**
 * 加权随机算法
 * @param prizes 奖项列表
 * @returns 中奖的奖项
 */
export function weightedRandom(prizes: Prize[]): Prize | null {
  if (prizes.length === 0) return null;

  const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0);
  let random = Math.random() * totalWeight;

  for (const prize of prizes) {
    random -= prize.weight;
    if (random <= 0) {
      return prize;
    }
  }

  return prizes[prizes.length - 1];
}

/**
 * 均匀随机算法
 * @param prizes 奖项列表
 * @returns 中奖的奖项
 */
export function uniformRandom(prizes: Prize[]): Prize | null {
  if (prizes.length === 0) return null;
  const index = Math.floor(Math.random() * prizes.length);
  return prizes[index];
}

/**
 * 数字范围内随机
 * @param min 最小值
 * @param max 最大值
 * @returns 随机数字
 */
export function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 从数组中随机选择指定数量的元素（不重复）
 * 使用 Fisher-Yates 洗牌算法确保真正的随机性
 * @param array 数组
 * @param count 选择数量
 * @returns 选中的元素数组
 */
export function randomSelect<T>(array: T[], count: number): T[] {
  if (count >= array.length) return [...array];
  if (count <= 0) return [];

  // Fisher-Yates 洗牌算法
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

/**
 * 从数组中随机选择一个元素
 * @param array 数组
 * @returns 随机元素
 */
export function randomOne<T>(array: T[]): T | null {
  if (array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

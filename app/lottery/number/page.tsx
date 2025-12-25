'use client';

import { useState, useEffect } from 'react';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { randomInRange } from '@/lib/lottery-utils';

export default function NumberLottery() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [result, setResult] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState<{ number: number; timestamp: number }[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = storage.get(STORAGE_KEYS.NUMBER_HISTORY, { min: 1, max: 100, history: [] });
    setMin(saved.min);
    setMax(saved.max);
    setHistory(saved.history);
  }, []);

  useEffect(() => {
    if (mounted) {
      storage.set(STORAGE_KEYS.NUMBER_HISTORY, { min, max, history });
    }
  }, [min, max, history, mounted]);

  const handleGenerate = () => {
    if (generating) return;
    if (min >= max) {
      alert('最小值必须小于最大值！');
      return;
    }

    setGenerating(true);
    setResult(null);

    // 动画效果
    let count = 0;
    const interval = setInterval(() => {
      setResult(randomInRange(min, max));
      count++;
      if (count > 20) {
        clearInterval(interval);
        const finalNumber = randomInRange(min, max);
        setResult(finalNumber);
        setGenerating(false);
        setHistory([{ number: finalNumber, timestamp: Date.now() }, ...history]);
      }
    }, 50);
  };

  const resetHistory = () => {
    setHistory([]);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">数字抽奖</h1>
        <p className="text-gray-600 mt-1">设定范围，随机生成中奖数字</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：抽奖区域 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最小值
                </label>
                <input
                  type="number"
                  value={min}
                  onChange={(e) => setMin(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最大值
                </label>
                <input
                  type="number"
                  value={max}
                  onChange={(e) => setMax(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating || min >= max}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {generating ? '生成中...' : '开始开奖'}
            </button>

            {result !== null && !generating && (
              <div className="mt-6 p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-2">中奖数字</p>
                <p className="text-6xl font-bold text-blue-600">{result}</p>
              </div>
            )}

            {min >= max && (
              <p className="text-red-600 text-center">最小值必须小于最大值！</p>
            )}
          </div>
        </div>

        {/* 右侧：历史记录 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">抽奖历史</h2>
            {history.length > 0 && (
              <button
                onClick={resetHistory}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                清空历史
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              暂无抽奖记录
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {history.map((record, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-2xl font-bold text-blue-600">{record.number}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(record.timestamp).toLocaleString('zh-CN')}
                  </span>
                </div>
              ))}
            </div>
          )}

          {history.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">总计</p>
                  <p className="text-2xl font-bold text-blue-600">{history.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">最大值</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.max(...history.map((h) => h.number))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">最小值</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.min(...history.map((h) => h.number))}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { Prize, weightedRandom, uniformRandom } from '@/lib/lottery-utils';

interface BoxConfig {
  prizes: Prize[];
  isUniform: boolean;
}

export default function BoxLottery() {
  const [config, setConfig] = useState<BoxConfig>(() =>
    storage.get(STORAGE_KEYS.BOX_CONFIG, {
      prizes: [
        { id: '1', name: '特等奖', weight: 1 },
        { id: '2', name: '一等奖', weight: 5 },
        { id: '3', name: '二等奖', weight: 15 },
        { id: '4', name: '三等奖', weight: 30 },
        { id: '5', name: '谢谢参与', weight: 49 },
      ],
      isUniform: false,
    })
  );

  const [history, setHistory] = useState<{ prize: string; timestamp: number }[]>(() =>
    storage.get(STORAGE_KEYS.BOX_HISTORY, [])
  );

  const [results, setResults] = useState<string[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    storage.set(STORAGE_KEYS.BOX_CONFIG, config);
  }, [config]);

  useEffect(() => {
    storage.set(STORAGE_KEYS.BOX_HISTORY, history);
  }, [history]);

  const handleDraw = (count: number) => {
    if (drawing || config.prizes.length === 0) return;

    setDrawing(true);
    setResults([]);

    // 模拟抽取动画
    const interval = setInterval(() => {
      const randomPrize = uniformRandom(config.prizes);
      if (randomPrize) {
        setResults(Array(count).fill(randomPrize.name));
      }
    }, 100);

    setTimeout(() => {
      clearInterval(interval);

      // 最终结果
      const finalResults: string[] = [];
      for (let i = 0; i < count; i++) {
        const winningPrize = config.isUniform
          ? uniformRandom(config.prizes)
          : weightedRandom(config.prizes);
        if (winningPrize) {
          finalResults.push(winningPrize.name);
        }
      }

      setResults(finalResults);
      setDrawing(false);

      // 添加到历史
      const timestamp = Date.now();
      finalResults.forEach((prize) => {
        setHistory((prev) => [{ prize, timestamp }, ...prev]);
      });
    }, 1000);
  };

  const handlePrizeChange = (id: string, field: keyof Prize, value: string | number) => {
    setConfig({
      ...config,
      prizes: config.prizes.map((prize) =>
        prize.id === id ? { ...prize, [field]: value } : prize
      ),
    });
  };

  const addPrize = () => {
    const newId = String(Date.now());
    setConfig({
      ...config,
      prizes: [...config.prizes, { id: newId, name: `奖项${config.prizes.length + 1}`, weight: 10 }],
    });
  };

  const removePrize = (id: string) => {
    setConfig({
      ...config,
      prizes: config.prizes.filter((prize) => prize.id !== id),
    });
  };

  const resetHistory = () => {
    setHistory([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">暗箱抽奖</h1>
        <p className="text-gray-600 mt-1">盲抽模式，支持单次和多次连抽</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：抽奖区域 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center space-y-4">
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleDraw(1)}
                disabled={drawing || config.prizes.length === 0}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {drawing ? '抽取中...' : '单次抽取'}
              </button>
              <button
                onClick={() => handleDraw(5)}
                disabled={drawing || config.prizes.length === 0}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {drawing ? '抽取中...' : '5次连抽'}
              </button>
            </div>

            {results.length > 0 && (
              <div className="mt-6 p-6 bg-gray-50 rounded-lg min-h-[150px] flex items-center justify-center">
                <div className="grid grid-cols-1 gap-2 w-full">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white border-2 border-blue-500 rounded-lg text-center animate-pulse"
                    >
                      <p className="text-lg font-bold text-blue-600">{result}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {config.prizes.length === 0 && (
              <p className="text-red-600">请先配置奖项！</p>
            )}
          </div>
        </div>

        {/* 右侧：配置区域 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">奖项配置</h2>
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              {editing ? '完成编辑' : '编辑配置'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="uniform"
                checked={config.isUniform}
                onChange={(e) => setConfig({ ...config, isUniform: e.target.checked })}
                disabled={!editing}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="uniform" className="text-sm">
                均匀概率（所有奖项概率均等）
              </label>
            </div>

            {editing && (
              <button
                onClick={addPrize}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                添加奖项
              </button>
            )}

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {config.prizes.map((prize, index) => (
                <div key={prize.id} className="flex gap-2 items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600 w-8">{index + 1}.</span>
                  <input
                    type="text"
                    value={prize.name}
                    onChange={(e) => handlePrizeChange(prize.id, 'name', e.target.value)}
                    disabled={!editing}
                    className="flex-1 px-2 py-1 border rounded text-sm disabled:bg-white"
                  />
                  {!config.isUniform && (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={prize.weight}
                        onChange={(e) =>
                          handlePrizeChange(prize.id, 'weight', parseInt(e.target.value) || 0)
                        }
                        disabled={!editing}
                        className="w-16 px-2 py-1 border rounded text-sm disabled:bg-white"
                        min="0"
                      />
                      <span className="text-xs text-gray-500">%</span>
                    </div>
                  )}
                  {editing && config.prizes.length > 1 && (
                    <button
                      onClick={() => removePrize(prize.id)}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      删除
                    </button>
                  )}
                </div>
              ))}
            </div>

            {!config.isUniform && (
              <div className="text-sm text-gray-600">
                总权重：{config.prizes.reduce((sum, p) => sum + p.weight, 0)}%
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 历史记录 */}
      {history.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">抽奖历史</h2>
            <button
              onClick={resetHistory}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              清空历史
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {history.map((record, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium">{record.prize}</span>
                <span className="text-sm text-gray-500">
                  {new Date(record.timestamp).toLocaleString('zh-CN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

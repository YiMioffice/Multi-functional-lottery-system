'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { Prize, weightedRandom, uniformRandom } from '@/lib/lottery-utils';

interface WheelConfig {
  prizes: Prize[];
  isUniform: boolean;
}

const defaultConfig: WheelConfig = {
  prizes: [
    { id: '1', name: '一等奖', weight: 5 },
    { id: '2', name: '二等奖', weight: 15 },
    { id: '3', name: '三等奖', weight: 30 },
    { id: '4', name: '谢谢参与', weight: 50 },
  ],
  isUniform: false,
};

export default function WheelLottery() {
  const router = useRouter();
  const [config, setConfig] = useState<WheelConfig>(defaultConfig);
  const [history, setHistory] = useState<{ prize: string; timestamp: number }[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 检查登录状态
    const token = localStorage.getItem('token');
    if (!token) {
      // 未登录，跳转到登录页
      alert('请先登录后再使用转盘抽奖功能');
      router.push('/auth');
      return;
    }
    setIsLoggedIn(true);
    setConfig(storage.get(STORAGE_KEYS.WHEEL_CONFIG, defaultConfig));
    setHistory(storage.get(STORAGE_KEYS.WHEEL_HISTORY, []));
  }, [router]);

  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (mounted && isLoggedIn) {
      storage.set(STORAGE_KEYS.WHEEL_CONFIG, config);
    }
  }, [config, mounted, isLoggedIn]);

  useEffect(() => {
    if (mounted && isLoggedIn) {
      storage.set(STORAGE_KEYS.WHEEL_HISTORY, history);
    }
  }, [history, mounted, isLoggedIn]);

  // 如果未登录，不渲染任何内容
  if (!isLoggedIn) {
    return null;
  }

  const handleSpin = () => {
    if (isSpinning || config.prizes.length === 0) return;

    setIsSpinning(true);
    setResult(null);

    // 使用加权或均匀随机算法
    const winningPrize = config.isUniform
      ? uniformRandom(config.prizes)
      : weightedRandom(config.prizes);

    if (!winningPrize) return;

    // 计算目标角度
    const prizeIndex = config.prizes.findIndex((p) => p.id === winningPrize.id);
    const sliceAngle = 360 / config.prizes.length;
    const targetAngle = 360 - (prizeIndex * sliceAngle + sliceAngle / 2);

    // 多转几圈后停止
    const spins = 5;
    const finalAngle = currentAngle + spins * 360 + targetAngle - (currentAngle % 360);

    setCurrentAngle(finalAngle);

    // 动画结束后显示结果
    setTimeout(() => {
      setIsSpinning(false);
      setResult(winningPrize.name);
      setHistory([{ prize: winningPrize.name, timestamp: Date.now() }, ...history]);
    }, 3000);
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

  // 绘制转盘
  const renderWheel = () => {
    if (config.prizes.length === 0) return null;

    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    ];

    return (
      <div className="relative inline-block">
        <svg
          width="400"
          height="400"
          style={{
            transform: `rotate(${currentAngle}deg)`,
            transition: isSpinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
          }}
        >
          {config.prizes.map((prize, index) => {
            const startAngle = (index * 360) / config.prizes.length;
            const endAngle = ((index + 1) * 360) / config.prizes.length;
            const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

            const startRad = (startAngle - 90) * (Math.PI / 180);
            const endRad = (endAngle - 90) * (Math.PI / 180);

            const x1 = 200 + 180 * Math.cos(startRad);
            const y1 = 200 + 180 * Math.sin(startRad);
            const x2 = 200 + 180 * Math.cos(endRad);
            const y2 = 200 + 180 * Math.sin(endRad);

            const color = colors[index % colors.length];

            return (
              <g key={prize.id}>
                <path
                  d={`M 200 200 L ${x1} ${y1} A 180 180 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={color}
                  stroke="#fff"
                  strokeWidth="2"
                />
                <text
                  x={200 + 120 * Math.cos((startRad + endRad) / 2)}
                  y={200 + 120 * Math.sin((startRad + endRad) / 2)}
                  fill="#fff"
                  fontSize="14"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${(startAngle + endAngle) / 2}, ${200 + 120 * Math.cos((startRad + endRad) / 2)}, ${200 + 120 * Math.sin((startRad + endRad) / 2)})`}
                >
                  {prize.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* 指针 */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[30px] border-l-transparent border-r-transparent border-t-red-600"></div>
        </div>

        {/* 中心点 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">转盘抽奖</h1>
        <p className="text-gray-600 mt-1">点击按钮开始抽奖，支持均匀和不均匀概率</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：转盘区域 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-center mb-6">{renderWheel()}</div>

          <div className="text-center space-y-4">
            <button
              onClick={handleSpin}
              disabled={isSpinning || config.prizes.length === 0}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSpinning ? '抽奖中...' : '开始抽奖'}
            </button>

            {result && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-lg font-semibold text-green-800">
                  恭喜您获得：{result}
                </p>
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

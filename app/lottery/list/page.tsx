'use client';

import { useState, useEffect } from 'react';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { randomSelect } from '@/lib/lottery-utils';

export default function ListLottery() {
  const [participants, setParticipants] = useState<string[]>([]);
  const [drawCount, setDrawCount] = useState(1);
  const [results, setResults] = useState<string[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [history, setHistory] = useState<{ winners: string[]; timestamp: number }[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setParticipants(storage.get(STORAGE_KEYS.LIST_CONFIG, []));
    setHistory(storage.get(STORAGE_KEYS.LIST_HISTORY, []));
  }, []);

  useEffect(() => {
    if (mounted) {
      storage.set(STORAGE_KEYS.LIST_CONFIG, participants);
    }
  }, [participants, mounted]);

  useEffect(() => {
    if (mounted) {
      storage.set(STORAGE_KEYS.LIST_HISTORY, history);
    }
  }, [history, mounted]);

  const handleDraw = () => {
    if (drawing) return;
    if (participants.length === 0) {
      alert('请先添加参与名单！');
      return;
    }
    if (drawCount < 1) {
      alert('抽取人数必须大于0！');
      return;
    }
    if (drawCount > participants.length) {
      alert(`抽取人数不能超过名单总数（${participants.length}）！`);
      return;
    }

    setDrawing(true);
    setResults([]);

    // 动画效果
    let count = 0;
    const interval = setInterval(() => {
      const tempResults = randomSelect(participants, drawCount);
      setResults(tempResults);
      count++;
      if (count > 20) {
        clearInterval(interval);
        const finalResults = randomSelect(participants, drawCount);
        setResults(finalResults);
        setDrawing(false);
        setHistory([{ winners: finalResults, timestamp: Date.now() }, ...history]);
      }
    }, 50);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;

      // 解析文本（支持换行、逗号、分号分隔）
      const names = text
        .split(/[\n,;，；]/)
        .map((name) => name.trim())
        .filter((name) => name.length > 0);

      // 去重
      const uniqueNames = Array.from(new Set(names));
      setParticipants(uniqueNames);
    };
    reader.readAsText(file);
  };

  const handleAddParticipant = () => {
    const name = prompt('请输入参与人姓名：');
    if (name && name.trim()) {
      setParticipants([...participants, name.trim()]);
    }
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const resetHistory = () => {
    setHistory([]);
    setResults([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">名单抽奖</h1>
        <p className="text-gray-600 mt-1">上传名单，随机抽取中奖人</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：抽奖区域 */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">抽奖设置</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  抽取人数
                </label>
                <input
                  type="number"
                  value={drawCount}
                  onChange={(e) => setDrawCount(parseInt(e.target.value) || 1)}
                  min="1"
                  max={participants.length}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleDraw}
                disabled={drawing || participants.length === 0}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {drawing ? '抽取中...' : '开始抽奖'}
              </button>
            </div>
          </div>

          {results.length > 0 && !drawing && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">中奖名单</h2>
              <div className="grid grid-cols-1 gap-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg text-center"
                  >
                    <p className="text-lg font-bold text-orange-600">
                      #{index + 1} - {result}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右侧：名单管理 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            参与名单 ({participants.length}人)
          </h2>

          <div className="space-y-4">
            <div className="flex gap-2">
              <label className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded text-center cursor-pointer hover:bg-gray-200 transition-colors">
                <span>上传文件</span>
                <input
                  type="file"
                  accept=".txt,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleAddParticipant}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                添加
              </button>
              {participants.length > 0 && (
                <button
                  onClick={() => setParticipants([])}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  清空
                </button>
              )}
            </div>

            <div className="text-xs text-gray-500">
              支持 .txt 或 .csv 文件，每行一个姓名，或用逗号/分号分隔
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {participants.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  暂无参与人，请添加或上传文件
                </div>
              ) : (
                participants.map((name, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm">
                      <span className="text-gray-500 mr-2">{index + 1}.</span>
                      {name}
                    </span>
                    <button
                      onClick={() => handleRemoveParticipant(index)}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                    >
                      删除
                    </button>
                  </div>
                ))
              )}
            </div>
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
          <div className="space-y-4">
            {history.map((record, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">第 {history.length - index} 次</span>
                  <span className="text-sm text-gray-500">
                    {new Date(record.timestamp).toLocaleString('zh-CN')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {record.winners.map((winner, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {winner}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

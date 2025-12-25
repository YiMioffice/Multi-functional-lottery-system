'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  return (
    <div className="text-center py-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">欢迎使用多功能抽奖系统</h2>
      <p className="text-gray-600 mb-8">创建转盘、分享链接、在线抽奖</p>

      <div className="mb-12 flex justify-center gap-4">
        {isLoggedIn ? (
          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-lg"
          >
            进入管理面板
          </button>
        ) : (
          <>
            <button
              onClick={() => router.push('/auth')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-lg"
            >
              登录 / 注册
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        <a
          href="/lottery/wheel"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-2">转盘抽奖</h3>
          <p className="text-gray-600 text-sm">支持均匀和不均匀概率，自定义奖项和权重</p>
        </a>

        <a
          href="/lottery/box"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-2">暗箱抽奖</h3>
          <p className="text-gray-600 text-sm">盲抽模式，支持单次和多次连抽</p>
        </a>

        <a
          href="/lottery/number"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-2">数字抽奖</h3>
          <p className="text-gray-600 text-sm">设定范围，随机生成中奖数字</p>
        </a>

        <a
          href="/lottery/list"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-2">名单抽奖</h3>
          <p className="text-gray-600 text-sm">上传名单，随机抽取中奖人</p>
        </a>
      </div>
    </div>
  );
}

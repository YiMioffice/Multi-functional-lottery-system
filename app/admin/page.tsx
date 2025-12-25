'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiRequest } from '@/lib/api'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWheels: 0,
    totalDraws: 0,
    adminCount: 0,
  })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/auth')
      return
    }

    const user = JSON.parse(userData)
    if (user.role !== 'admin') {
      alert('权限不足，仅管理员可访问')
      router.push('/dashboard')
      return
    }

    loadStats()
  }, [router])

  const loadStats = async () => {
    try {
      const [usersRes, wheelsRes] = await Promise.all([
        apiRequest('/api/admin/users'),
        apiRequest('/api/admin/wheels'),
      ])

      const usersData = await usersRes.json()
      const wheelsData = await wheelsRes.json()

      const users = usersData.users || []
      const wheels = wheelsData.wheels || []

      const totalDraws = wheels.reduce(
        (sum: number, wheel: any) => sum + (wheel._count?.drawRecords || 0),
        0
      )
      const adminCount = users.filter((u: any) => u.role === 'admin').length

      setStats({
        totalUsers: users.length,
        totalWheels: wheels.length,
        totalDraws,
        adminCount,
      })
    } catch (error: any) {
      alert('加载统计数据失败：' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              ← 返回
            </button>
            <h1 className="text-2xl font-bold text-gray-900">管理后台</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">总用户数</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {stats.totalUsers}
            </div>
            <div className="mt-1 text-xs text-gray-400">
              其中管理员 {stats.adminCount} 人
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">总转盘数</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {stats.totalWheels}
            </div>
            <div className="mt-1 text-xs text-gray-400">
              包含所有用户创建的转盘
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">总抽奖次数</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {stats.totalDraws}
            </div>
            <div className="mt-1 text-xs text-gray-400">
              所有转盘累计抽奖次数
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">平均抽奖</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {stats.totalWheels > 0
                ? (stats.totalDraws / stats.totalWheels).toFixed(1)
                : '0'}
            </div>
            <div className="mt-1 text-xs text-gray-400">
              每个转盘平均抽奖次数
            </div>
          </div>
        </div>

        {/* 管理入口 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => router.push('/admin/users')}
            className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-xl font-bold text-gray-900 mb-2">
              用户管理
            </div>
            <div className="text-gray-600 mb-4">
              查看、删除用户，修改用户角色权限
            </div>
            <div className="text-blue-600 font-medium">进入管理 →</div>
          </button>

          <button
            onClick={() => router.push('/admin/wheels')}
            className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition-shadow text-left"
          >
            <div className="text-xl font-bold text-gray-900 mb-2">
              转盘管理
            </div>
            <div className="text-gray-600 mb-4">
              查看所有转盘，查看抽奖记录，删除转盘
            </div>
            <div className="text-blue-600 font-medium">进入管理 →</div>
          </button>
        </div>
      </main>
    </div>
  )
}

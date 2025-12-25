'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiRequest } from '@/lib/api'

interface Wheel {
  id: string
  name: string
  description?: string
  isUniform: boolean
  shareCode: string
  createdAt: string
  user: {
    id: string
    email: string
    username: string
  }
  prizes: any[]
  _count: {
    drawRecords: number
  }
}

export default function AdminWheelsPage() {
  const router = useRouter()
  const [wheels, setWheels] = useState<Wheel[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

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

    setCurrentUser(user)
    loadWheels()
  }, [router])

  const loadWheels = async () => {
    try {
      const res = await apiRequest('/api/admin/wheels')
      const data = await res.json()
      setWheels(data.wheels)
    } catch (error: any) {
      alert('加载转盘失败：' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteWheel = async (wheelId: string) => {
    if (!confirm('确定要删除该转盘吗？此操作将删除所有相关记录！')) {
      return
    }

    try {
      await apiRequest(`/api/wheels/${wheelId}`, { method: 'DELETE' })
      setWheels(wheels.filter(w => w.id !== wheelId))
      alert('删除成功')
    } catch (error: any) {
      alert('删除失败：' + error.message)
    }
  }

  const copyShareLink = (shareCode: string) => {
    const link = `${window.location.origin}/share/${shareCode}`
    navigator.clipboard.writeText(link)
    alert('分享链接已复制到剪贴板！')
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
              onClick={() => router.push('/admin')}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              ← 返回
            </button>
            <h1 className="text-2xl font-bold text-gray-900">转盘管理</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">
              所有转盘 ({wheels.length})
            </h2>
          </div>

          {wheels.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              暂无转盘
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      转盘信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      创建者
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      奖品数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      抽奖次数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      创建时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {wheels.map((wheel) => (
                    <tr key={wheel.id}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {wheel.name}
                          </div>
                          {wheel.description && (
                            <div className="text-sm text-gray-500">
                              {wheel.description}
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            分享码: {wheel.shareCode}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {wheel.user.username}
                        </div>
                        <div className="text-xs text-gray-500">
                          {wheel.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {wheel.prizes.length} 个
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {wheel._count.drawRecords} 次
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(wheel.createdAt).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => router.push(`/dashboard/wheels/${wheel.id}`)}
                            className="text-blue-600 hover:text-blue-900 text-left"
                          >
                            查看详情
                          </button>
                          <button
                            onClick={() => copyShareLink(wheel.shareCode)}
                            className="text-green-600 hover:text-green-900 text-left"
                          >
                            复制链接
                          </button>
                          <button
                            onClick={() => handleDeleteWheel(wheel.id)}
                            className="text-red-600 hover:text-red-900 text-left"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { apiRequest } from '@/lib/api'

interface Prize {
  id: string
  name: string
  weight: number
  imageUrl?: string
  order: number
}

interface DrawRecord {
  id: string
  participantName: string
  createdAt: string
  prize: Prize
}

interface Wheel {
  id: string
  name: string
  description?: string
  isUniform: boolean
  shareCode: string
  prizes: Prize[]
  drawRecords: DrawRecord[]
}

export default function WheelDetailPage() {
  const router = useRouter()
  const params = useParams()
  const wheelId = params.id as string

  const [wheel, setWheel] = useState<Wheel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/auth')
      return
    }
    loadWheel()
  }, [wheelId])

  const loadWheel = async () => {
    try {
      const res = await apiRequest(`/api/wheels/${wheelId}`)
      const data = await res.json()
      setWheel(data.wheel)
    } catch (error) {
      console.error('加载转盘失败:', error)
      alert('加载失败，返回列表页')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const copyShareLink = () => {
    if (!wheel) return
    const link = `${window.location.origin}/share/${wheel.shareCode}`
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

  if (!wheel) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              ← 返回
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{wheel.name}</h1>
              {wheel.description && (
                <p className="text-sm text-gray-600 mt-1">{wheel.description}</p>
              )}
            </div>
            <button
              onClick={copyShareLink}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              复制分享链接
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 奖品列表 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">奖品配置</h2>
            <p className="text-sm text-gray-600 mb-3">
              概率模式: {wheel.isUniform ? '均匀概率' : '加权概率'}
            </p>

            <div className="space-y-3">
              {wheel.prizes.map((prize, index) => (
                <div key={prize.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600 w-8">{index + 1}.</span>
                  {prize.imageUrl && (
                    <img
                      src={prize.imageUrl}
                      alt={prize.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{prize.name}</p>
                    {!wheel.isUniform && (
                      <p className="text-xs text-gray-600">权重: {prize.weight}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!wheel.isUniform && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  总权重: {wheel.prizes.reduce((sum, p) => sum + p.weight, 0)}
                </p>
              </div>
            )}
          </div>

          {/* 抽奖记录 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">
              抽奖记录 ({wheel.drawRecords.length})
            </h2>

            {wheel.drawRecords.length === 0 ? (
              <p className="text-gray-600 text-center py-8">暂无抽奖记录</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {wheel.drawRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-medium">{record.participantName}</p>
                      <p className="text-sm text-gray-600">
                        抽中: {record.prize.name}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(record.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 统计信息 */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">抽奖统计</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded">
              <p className="text-2xl font-bold text-blue-600">{wheel.drawRecords.length}</p>
              <p className="text-sm text-gray-600">总抽奖次数</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded">
              <p className="text-2xl font-bold text-green-600">
                {new Set(wheel.drawRecords.map(r => r.participantName)).size}
              </p>
              <p className="text-sm text-gray-600">参与人数</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded">
              <p className="text-2xl font-bold text-purple-600">{wheel.prizes.length}</p>
              <p className="text-sm text-gray-600">奖品种类</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded">
              <p className="text-2xl font-bold text-orange-600">{wheel.shareCode}</p>
              <p className="text-sm text-gray-600">分享码</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

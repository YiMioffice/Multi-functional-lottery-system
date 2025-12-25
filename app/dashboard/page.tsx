'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiRequest, uploadFile } from '@/lib/api'

interface Prize {
  id?: string
  name: string
  weight: number
  imageUrl?: string
  order: number
}

interface Wheel {
  id: string
  name: string
  description?: string
  type: string
  isUniform: boolean
  shareCode: string
  prizes: Prize[]
  _count?: { drawRecords: number }
  createdAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [wheels, setWheels] = useState<Wheel[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedWheel, setSelectedWheel] = useState<Wheel | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/auth')
      return
    }
    setUser(JSON.parse(userData))
    loadWheels()
  }, [])

  const loadWheels = async () => {
    try {
      const res = await apiRequest('/api/wheels')
      const data = await res.json()
      setWheels(data.wheels)
    } catch (error) {
      console.error('加载转盘失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/auth')
  }

  const handleDeleteWheel = async (wheelId: string) => {
    if (!confirm('确定要删除这个转盘吗？删除后无法恢复！')) {
      return
    }

    try {
      await apiRequest(`/api/wheels/${wheelId}`, { method: 'DELETE' })
      setWheels(wheels.filter(w => w.id !== wheelId))
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
      {/* 头部 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">转盘管理</h1>
            <p className="text-sm text-gray-600 mt-1">欢迎，{user?.username}</p>
          </div>
          <div className="flex gap-3">
            {user?.role === 'admin' && (
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                管理后台
              </button>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              创建新转盘
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {wheels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">还没有创建任何转盘</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              创建第一个转盘
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wheels.map((wheel) => {
              const typeLabels: Record<string, string> = {
                wheel: '转盘抽奖',
                box: '暗箱抽奖',
                number: '数字抽奖',
                list: '名单抽奖',
              }

              return (
                <div key={wheel.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{wheel.name}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {typeLabels[wheel.type] || wheel.type}
                    </span>
                  </div>
                  {wheel.description && (
                    <p className="text-sm text-gray-600 mb-3">{wheel.description}</p>
                  )}

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {(wheel.type === 'wheel' || wheel.type === 'box') && (
                      <p>奖品数量: {wheel.prizes?.length || 0}</p>
                    )}
                    <p>抽奖次数: {wheel._count?.drawRecords || 0}</p>
                    {(wheel.type === 'wheel' || wheel.type === 'box') && (
                      <p>概率模式: {wheel.isUniform ? '均匀' : '加权'}</p>
                    )}
                    <p className="text-xs">创建时间: {new Date(wheel.createdAt).toLocaleString('zh-CN')}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/wheels/${wheel.id}`)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      查看详情
                    </button>
                    <button
                      onClick={() => copyShareLink(wheel.shareCode)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      分享
                    </button>
                    <button
                      onClick={() => handleDeleteWheel(wheel.id)}
                      className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      删除
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* 创建转盘模态框 */}
      {showCreateModal && (
        <CreateWheelModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            loadWheels()
          }}
        />
      )}
    </div>
  )
}

// 创建转盘模态框组件
function CreateWheelModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'wheel' | 'box' | 'number' | 'list'>('wheel')
  const [isUniform, setIsUniform] = useState(false)
  const [showProbability, setShowProbability] = useState(true)
  const [prizes, setPrizes] = useState<Prize[]>([
    { name: '一等奖', weight: 10, order: 0 },
    { name: '二等奖', weight: 20, order: 1 },
    { name: '三等奖', weight: 30, order: 2 },
    { name: '谢谢参与', weight: 40, order: 3 },
  ])
  const [numberMin, setNumberMin] = useState(1)
  const [numberMax, setNumberMax] = useState(100)
  const [participants, setParticipants] = useState<string[]>([])
  const [newParticipant, setNewParticipant] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAddPrize = () => {
    setPrizes([...prizes, { name: `奖品${prizes.length + 1}`, weight: 10, order: prizes.length }])
  }

  const handleRemovePrize = (index: number) => {
    setPrizes(prizes.filter((_, i) => i !== index))
  }

  const handlePrizeChange = (index: number, field: keyof Prize, value: any) => {
    const newPrizes = [...prizes]
    newPrizes[index] = { ...newPrizes[index], [field]: value }
    setPrizes(newPrizes)
  }

  const handleImageUpload = async (index: number, file: File) => {
    try {
      const url = await uploadFile(file)
      handlePrizeChange(index, 'imageUrl', url)
    } catch (error: any) {
      alert('图片上传失败：' + error.message)
    }
  }

  const handleAddParticipant = () => {
    if (newParticipant.trim()) {
      setParticipants([...participants, newParticipant.trim()])
      setNewParticipant('')
    }
  }

  const handleRemoveParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const names = text
        .split(/[\n,;，；]/)
        .map((name) => name.trim())
        .filter((name) => name.length > 0)
      const uniqueNames = Array.from(new Set(names))
      setParticipants(uniqueNames)
    }
    reader.readAsText(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const requestBody: any = {
        name,
        description,
        type,
        isUniform,
        showProbability,
      }

      if (type === 'wheel' || type === 'box') {
        requestBody.prizes = prizes
      } else if (type === 'number') {
        requestBody.numberMin = numberMin
        requestBody.numberMax = numberMax
      } else if (type === 'list') {
        requestBody.participants = participants
      }

      const res = await apiRequest('/api/wheels', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '创建失败')
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const typeOptions = [
    { value: 'wheel', label: '转盘抽奖', desc: '旋转大转盘，视觉效果好' },
    { value: 'box', label: '暗箱抽奖', desc: '盲抽模式，支持连抽' },
    { value: 'number', label: '数字抽奖', desc: '随机生成中奖数字' },
    { value: 'list', label: '名单抽奖', desc: '从名单中随机抽取' },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[95vh] overflow-y-auto p-6 my-8">
        <h2 className="text-2xl font-bold mb-4">创建新转盘</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">转盘名称</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="例如：年会抽奖"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述（可选）</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              rows={2}
              placeholder="简单描述这个转盘的用途"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">抽奖类型</label>
            <div className="grid grid-cols-2 gap-3">
              {typeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value as any)}
                  className={`p-3 border-2 rounded-lg text-left transition-colors ${
                    type === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{option.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {(type === 'wheel' || type === 'box') && (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="uniform"
                  checked={isUniform}
                  onChange={(e) => setIsUniform(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="uniform" className="text-sm">均匀概率（所有奖品概率相等）</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showProbability"
                  checked={showProbability}
                  onChange={(e) => setShowProbability(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="showProbability" className="text-sm">
                  公开显示概率（参与者可以看到中奖概率）
                </label>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">奖品列表</label>
                  <button
                    type="button"
                    onClick={handleAddPrize}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    添加奖品
                  </button>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {prizes.map((prize, index) => (
                    <div key={index} className="border rounded-md p-3 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={prize.name}
                          onChange={(e) => handlePrizeChange(index, 'name', e.target.value)}
                          className="flex-1 px-2 py-1 border rounded text-sm"
                          placeholder="奖品名称"
                        />
                        {!isUniform && (
                          <input
                            type="number"
                            required
                            min="0"
                            value={prize.weight}
                            onChange={(e) => handlePrizeChange(index, 'weight', parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 border rounded text-sm"
                            placeholder="权重"
                          />
                        )}
                        {prizes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePrize(index)}
                            className="px-2 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            删除
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">奖品图片（可选）</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleImageUpload(index, file)
                            }}
                            className="text-sm"
                          />
                          {prize.imageUrl && (
                            <img src={prize.imageUrl} alt={prize.name} className="w-12 h-12 object-cover rounded" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {type === 'number' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">最小值</label>
                  <input
                    type="number"
                    required
                    value={numberMin}
                    onChange={(e) => setNumberMin(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">最大值</label>
                  <input
                    type="number"
                    required
                    value={numberMax}
                    onChange={(e) => setNumberMax(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500">
                系统将在 {numberMin} - {numberMax} 范围内随机生成中奖数字
              </div>
            </div>
          )}

          {type === 'list' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  参与名单 ({participants.length}人)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newParticipant}
                    onChange={(e) => setNewParticipant(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddParticipant())}
                    className="flex-1 px-3 py-2 border rounded-md"
                    placeholder="输入姓名后回车"
                  />
                  <button
                    type="button"
                    onClick={handleAddParticipant}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    添加
                  </button>
                  <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded cursor-pointer hover:bg-gray-200 flex items-center">
                    <span>上传文件</span>
                    <input
                      type="file"
                      accept=".txt,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  支持 .txt 或 .csv 文件，每行一个姓名，或用逗号/分号分隔
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
                  {participants.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
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
                          type="button"
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
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? '创建中...' : '创建转盘'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

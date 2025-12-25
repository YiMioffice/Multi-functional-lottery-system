'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { weightedRandom, uniformRandom, randomInRange, randomSelect, Prize as LotteryPrize } from '@/lib/lottery-utils'

interface Prize extends LotteryPrize {
  order: number
  imageUrl?: string
}

interface Wheel {
  id: string
  name: string
  description?: string
  type: string
  isUniform: boolean
  showProbability: boolean
  shareCode: string
  prizes: Prize[]
  numberMin?: number
  numberMax?: number
  participants?: string
  user: {
    username: string
  }
}

export default function SharePage() {
  const params = useParams()
  const shareCode = params.shareCode as string

  const [wheel, setWheel] = useState<Wheel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [participantName, setParticipantName] = useState('')
  const [showNameInput, setShowNameInput] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [currentAngle, setCurrentAngle] = useState(0)

  useEffect(() => {
    loadWheel()
  }, [shareCode])

  const loadWheel = async () => {
    try {
      const res = await fetch(`/api/share/${shareCode}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '加载失败')
      }

      setWheel(data.wheel)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStartDraw = () => {
    const savedName = localStorage.getItem(`participant_name_${shareCode}`)
    if (savedName) {
      setParticipantName(savedName)
      handleDraw(savedName)
    } else {
      setShowNameInput(true)
    }
  }

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!participantName.trim()) {
      alert('请输入您的姓名')
      return
    }
    localStorage.setItem(`participant_name_${shareCode}`, participantName)
    setShowNameInput(false)
    handleDraw(participantName)
  }

  const handleDraw = async (name: string) => {
    if (!wheel || isDrawing) return

    setIsDrawing(true)
    setResult(null)

    if (wheel.type === 'wheel' || wheel.type === 'box') {
      await handlePrizeDraw(name)
    } else if (wheel.type === 'number') {
      await handleNumberDraw(name)
    } else if (wheel.type === 'list') {
      await handleListDraw(name)
    }
  }

  const handlePrizeDraw = async (name: string) => {
    if (!wheel) return

    const winningPrize = wheel.isUniform
      ? uniformRandom(wheel.prizes)
      : weightedRandom(wheel.prizes)

    if (!winningPrize) return

    if (wheel.type === 'wheel') {
      // 转盘动画
      const prizeIndex = wheel.prizes.findIndex((p) => p.id === winningPrize.id)
      const sliceAngle = 360 / wheel.prizes.length
      const targetAngle = 360 - (prizeIndex * sliceAngle + sliceAngle / 2)
      const spins = 5
      const finalAngle = currentAngle + spins * 360 + targetAngle - (currentAngle % 360)
      setCurrentAngle(finalAngle)

      setTimeout(async () => {
        setIsDrawing(false)
        setResult(winningPrize)
        await saveDrawRecord(name, winningPrize.id)
      }, 3000)
    } else {
      // 暗箱抽奖动画
      let count = 0
      const interval = setInterval(() => {
        const randomPrize = uniformRandom(wheel.prizes)
        setResult(randomPrize)
        count++
        if (count > 20) {
          clearInterval(interval)
          setResult(winningPrize)
          setIsDrawing(false)
          saveDrawRecord(name, winningPrize.id)
        }
      }, 100)
    }
  }

  const handleNumberDraw = async (name: string) => {
    if (!wheel || wheel.numberMin === undefined || wheel.numberMax === undefined) return

    let count = 0
    const interval = setInterval(() => {
      setResult({ number: randomInRange(wheel.numberMin!, wheel.numberMax!) })
      count++
      if (count > 20) {
        clearInterval(interval)
        const finalNumber = randomInRange(wheel.numberMin!, wheel.numberMax!)
        setResult({ number: finalNumber })
        setIsDrawing(false)
        saveDrawRecord(name, undefined, finalNumber)
      }
    }, 50)
  }

  const handleListDraw = async (name: string) => {
    if (!wheel || !wheel.participants) return

    const participantsList = JSON.parse(wheel.participants) as string[]
    let count = 0
    const interval = setInterval(() => {
      const randomWinner = randomSelect(participantsList, 1)[0]
      setResult({ winner: randomWinner })
      count++
      if (count > 20) {
        clearInterval(interval)
        const finalWinner = randomSelect(participantsList, 1)[0]
        setResult({ winner: finalWinner })
        setIsDrawing(false)
        saveDrawRecord(name)
      }
    }, 50)
  }

  const saveDrawRecord = async (name: string, prizeId?: string, resultNumber?: number) => {
    if (!wheel) return

    try {
      const body: any = {
        wheelId: wheel.id,
        participantName: name,
      }
      if (prizeId) body.prizeId = prizeId
      if (resultNumber !== undefined) body.resultNumber = resultNumber

      await fetch('/api/draw-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } catch (error) {
      console.error('保存抽奖记录失败:', error)
    }
  }

  const renderWheelLottery = () => {
    if (!wheel || wheel.prizes.length === 0) return null

    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    ]

    return (
      <div className="relative inline-block">
        <svg
          width="400"
          height="400"
          style={{
            transform: `rotate(${currentAngle}deg)`,
            transition: isDrawing ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
          }}
        >
          {wheel.prizes.map((prize, index) => {
            const startAngle = (index * 360) / wheel.prizes.length
            const endAngle = ((index + 1) * 360) / wheel.prizes.length
            const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0

            const startRad = (startAngle - 90) * (Math.PI / 180)
            const endRad = (endAngle - 90) * (Math.PI / 180)

            const x1 = 200 + 180 * Math.cos(startRad)
            const y1 = 200 + 180 * Math.sin(startRad)
            const x2 = 200 + 180 * Math.cos(endRad)
            const y2 = 200 + 180 * Math.sin(endRad)

            const color = colors[index % colors.length]

            const midAngle = (startRad + endRad) / 2
            const textX = 200 + 120 * Math.cos(midAngle)
            const textY = 200 + 120 * Math.sin(midAngle)

            return (
              <g key={prize.id}>
                <path
                  d={`M 200 200 L ${x1} ${y1} A 180 180 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={color}
                  stroke="#fff"
                  strokeWidth="2"
                />

                {prize.imageUrl ? (
                  <image
                    href={prize.imageUrl}
                    x={textX - 25}
                    y={textY - 25}
                    width="50"
                    height="50"
                    clipPath="circle(25px at center)"
                  />
                ) : (
                  <text
                    x={textX}
                    y={textY}
                    fill="#fff"
                    fontSize="14"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${(startAngle + endAngle) / 2}, ${textX}, ${textY})`}
                  >
                    {prize.name}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[30px] border-l-transparent border-r-transparent border-t-red-600"></div>
        </div>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full"></div>
        </div>
      </div>
    )
  }

  const renderBoxLottery = () => {
    return (
      <div className="text-center space-y-6">
        {result && (
          <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 min-h-[200px] flex items-center justify-center">
            <div>
              <p className="text-3xl font-bold text-blue-600 mb-4">{result.name}</p>
              {result.imageUrl && (
                <img
                  src={result.imageUrl}
                  alt={result.name}
                  className="w-32 h-32 object-cover rounded-lg mx-auto"
                />
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderNumberLottery = () => {
    return (
      <div className="text-center space-y-6">
        <div className="p-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
          <p className="text-sm text-gray-600 mb-4">
            抽奖范围: {wheel?.numberMin} - {wheel?.numberMax}
          </p>
          {result && (
            <p className="text-7xl font-bold text-blue-600 animate-pulse">
              {result.number}
            </p>
          )}
        </div>
      </div>
    )
  }

  const renderListLottery = () => {
    const participantsList = wheel?.participants ? JSON.parse(wheel.participants) as string[] : []

    return (
      <div className="text-center space-y-6">
        <div className="p-8 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200">
          <p className="text-sm text-gray-600 mb-4">
            参与人数: {participantsList.length} 人
          </p>
          {result && (
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <p className="text-4xl font-bold text-orange-600">
                {result.winner}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderPrizeList = () => {
    if (!wheel || (wheel.type !== 'wheel' && wheel.type !== 'box')) return null

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4 text-center">奖品列表</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {wheel.prizes.map((prize) => (
            <div key={prize.id} className="text-center p-4 bg-gray-50 rounded-lg">
              {prize.imageUrl && (
                <img
                  src={prize.imageUrl}
                  alt={prize.name}
                  className="w-20 h-20 object-cover rounded-lg mx-auto mb-2"
                />
              )}
              <p className="font-medium text-sm">{prize.name}</p>
              {wheel.showProbability && !wheel.isUniform && (
                <p className="text-xs text-gray-500 mt-1">
                  概率: {((prize.weight / wheel.prizes.reduce((sum, p) => sum + p.weight, 0)) * 100).toFixed(1)}%
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      wheel: '转盘抽奖',
      box: '暗箱抽奖',
      number: '数字抽奖',
      list: '名单抽奖',
    }
    return labels[type] || type
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">加载中...</div>
      </div>
    )
  }

  if (error || !wheel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || '转盘不存在'}</p>
          <a href="/" className="text-blue-600 hover:underline">
            返回首页
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部信息 */}
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm mb-2">
            {getTypeLabel(wheel.type)}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{wheel.name}</h1>
          {wheel.description && (
            <p className="text-gray-600 mb-2">{wheel.description}</p>
          )}
          <p className="text-sm text-gray-500">由 {wheel.user.username} 创建</p>
        </div>

        {/* 抽奖区域 */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="flex justify-center mb-8">
            {wheel.type === 'wheel' && renderWheelLottery()}
            {wheel.type === 'box' && renderBoxLottery()}
            {wheel.type === 'number' && renderNumberLottery()}
            {wheel.type === 'list' && renderListLottery()}
          </div>

          <div className="text-center space-y-4">
            <button
              onClick={handleStartDraw}
              disabled={isDrawing}
              className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold rounded-full hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
            >
              {isDrawing ? '抽奖中...' : '开始抽奖'}
            </button>

            {result && !isDrawing && (wheel.type === 'wheel' || wheel.type === 'box') && (
              <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                <p className="text-2xl font-bold text-green-800 mb-2">
                  恭喜您抽中：{result.name}
                </p>
                {result.imageUrl && (
                  <img
                    src={result.imageUrl}
                    alt={result.name}
                    className="w-32 h-32 object-cover rounded-lg mx-auto mt-4"
                  />
                )}
              </div>
            )}

            {result && !isDrawing && wheel.type === 'number' && (
              <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                <p className="text-2xl font-bold text-green-800">
                  中奖数字：{result.number}
                </p>
              </div>
            )}

            {result && !isDrawing && wheel.type === 'list' && (
              <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                <p className="text-2xl font-bold text-green-800">
                  中奖者：{result.winner}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 奖品列表或参与名单 */}
        {renderPrizeList()}

        {wheel.type === 'list' && wheel.participants && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4 text-center">
              参与名单 ({JSON.parse(wheel.participants).length}人)
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 max-h-60 overflow-y-auto">
              {(JSON.parse(wheel.participants) as string[]).map((name, index) => (
                <div key={index} className="text-center p-2 bg-gray-50 rounded text-sm">
                  {name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 姓名输入模态框 */}
      {showNameInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4 text-center">请输入您的姓名</h2>
            <form onSubmit={handleNameSubmit}>
              <input
                type="text"
                required
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg"
                placeholder="您的姓名"
                autoFocus
              />
              <div className="mt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  开始抽奖
                </button>
                <button
                  type="button"
                  onClick={() => setShowNameInput(false)}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

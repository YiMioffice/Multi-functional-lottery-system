'use client'

import { useState, useRef, useEffect } from 'react'
import { Prize, weightedRandom, uniformRandom } from '@/lib/lottery-utils'

interface WheelLotteryProps {
  prizes: Prize[]
  isUniform: boolean
  participantName: string
  onDraw: (prize: Prize) => Promise<void>
}

export default function WheelLottery({ prizes, isUniform, participantName, onDraw }: WheelLotteryProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState<Prize | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotation, setRotation] = useState(0)

  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF']

  useEffect(() => {
    drawWheel()
  }, [rotation])

  const drawWheel = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 10

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate((rotation * Math.PI) / 180)

    const arcSize = (2 * Math.PI) / prizes.length

    prizes.forEach((prize, index) => {
      const startAngle = index * arcSize
      const endAngle = startAngle + arcSize

      ctx.beginPath()
      ctx.fillStyle = colors[index % colors.length]
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, radius, startAngle, endAngle)
      ctx.lineTo(0, 0)
      ctx.fill()
      ctx.stroke()

      ctx.save()
      ctx.rotate(startAngle + arcSize / 2)
      ctx.textAlign = 'center'
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px Arial'
      ctx.fillText(prize.name, radius * 0.65, 0)
      ctx.restore()
    })

    ctx.restore()

    // 绘制指针
    ctx.beginPath()
    ctx.fillStyle = '#FF0000'
    ctx.moveTo(centerX, centerY - radius - 10)
    ctx.lineTo(centerX - 15, centerY - radius + 10)
    ctx.lineTo(centerX + 15, centerY - radius + 10)
    ctx.closePath()
    ctx.fill()
  }

  const handleSpin = async () => {
    if (isSpinning || !participantName.trim()) return

    setIsSpinning(true)
    setResult(null)

    const winningPrize = isUniform ? uniformRandom(prizes) : weightedRandom(prizes)
    if (!winningPrize) return

    const winningIndex = prizes.findIndex(p => p.id === winningPrize.id)
    const arcSize = 360 / prizes.length
    const targetRotation = 360 * 5 + (360 - winningIndex * arcSize - arcSize / 2)

    const duration = 3000
    const startTime = Date.now()
    const startRotation = rotation

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentRotation = startRotation + targetRotation * easeOut

      setRotation(currentRotation % 360)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsSpinning(false)
        setResult(winningPrize)
        onDraw(winningPrize)
      }
    }

    requestAnimationFrame(animate)
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="max-w-full"
        />
      </div>

      <button
        onClick={handleSpin}
        disabled={isSpinning || !participantName.trim()}
        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-bold rounded-full hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 shadow-lg"
      >
        {isSpinning ? '抽奖中...' : '开始抽奖'}
      </button>

      {result && !isSpinning && (
        <div className="mt-6 p-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-xl animate-bounce">
          <p className="text-white text-xl font-bold text-center">
            恭喜您抽中：{result.name}
          </p>
          {result.imageUrl && (
            <img
              src={result.imageUrl}
              alt={result.name}
              className="mt-4 w-48 h-48 object-cover mx-auto rounded-lg"
            />
          )}
        </div>
      )}
    </div>
  )
}

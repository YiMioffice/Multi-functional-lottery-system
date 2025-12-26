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

  // Bauhaus Palette: Red, Blue, Yellow, White
  const colors = ['#E93424', '#16508D', '#F4CD00', '#F9F9F5']

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

      // Add thick borders for Bauhaus look
      ctx.strokeStyle = '#1A1A1A'
      ctx.lineWidth = 4
      ctx.stroke()

      ctx.save()
      ctx.rotate(startAngle + arcSize / 2)
      ctx.textAlign = 'center'
      // Adjust text color based on background
      const bgColor = colors[index % colors.length]
      ctx.fillStyle = (bgColor === '#F9F9F5' || bgColor === '#F4CD00') ? '#1A1A1A' : '#F9F9F5'
      ctx.font = 'bold 16px Arial'
      ctx.fillText(prize.name, radius * 0.65, 0)
      ctx.restore()
    })

    ctx.restore()

    // Draw pointer (Bauhaus style: simple triangle outline or solid)
    ctx.beginPath()
    ctx.fillStyle = '#1A1A1A'
    ctx.moveTo(centerX, centerY - radius - 20)
    ctx.lineTo(centerX - 20, centerY - radius + 20)
    ctx.lineTo(centerX + 20, centerY - radius + 20)
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
      <div className="relative border-4 border-bauhaus-black rounded-full overflow-hidden p-1 bg-white shadow-hard">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="max-w-full rounded-full"
        />
      </div>

      <button
        onClick={handleSpin}
        disabled={isSpinning || !participantName.trim()}
        className="bauhaus-button-primary px-8 py-4 text-xl uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSpinning ? '抽奖中...' : '开始抽奖'}
      </button>

      {result && !isSpinning && (
        <div className="mt-6 p-6 bauhaus-card bg-bauhaus-yellow text-bauhaus-black animate-pulse">
          <p className="text-2xl font-black text-center uppercase">
            恭喜您抽中：{result.name}
          </p>
          {result.imageUrl && (
            <img
              src={result.imageUrl}
              alt={result.name}
              className="mt-4 w-48 h-48 object-cover mx-auto border-4 border-bauhaus-black shadow-hard"
            />
          )}
        </div>
      )}
    </div>
  )
}

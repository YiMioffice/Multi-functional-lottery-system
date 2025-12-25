import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createDrawRecordSchema = z.object({
  wheelId: z.string(),
  prizeId: z.string().optional(),
  participantName: z.string().min(1, '请输入您的姓名').max(50, '姓名最多50个字符'),
  resultNumber: z.number().int().optional(), // 数字抽奖结果
})

// 创建抽奖记录
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 验证输入
    const validationResult = createDrawRecordSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { wheelId, prizeId, participantName, resultNumber } = validationResult.data

    // 验证转盘是否存在
    const wheel = await prisma.wheel.findUnique({
      where: { id: wheelId },
      include: {
        prizes: true,
      },
    })

    if (!wheel) {
      return NextResponse.json(
        { error: '转盘不存在' },
        { status: 404 }
      )
    }

    // 根据转盘类型验证
    if ((wheel.type === 'wheel' || wheel.type === 'box') && prizeId) {
      const prize = wheel.prizes.find(p => p.id === prizeId)
      if (!prize) {
        return NextResponse.json(
          { error: '奖品不存在' },
          { status: 404 }
        )
      }
    }

    // 创建抽奖记录
    const drawRecord = await prisma.drawRecord.create({
      data: {
        wheelId,
        prizeId: prizeId || null,
        participantName,
        resultNumber: resultNumber || null,
      },
      include: {
        prize: true,
      },
    })

    return NextResponse.json({ drawRecord })
  } catch (error) {
    console.error('创建抽奖记录错误:', error)
    return NextResponse.json(
      { error: '创建抽奖记录失败' },
      { status: 500 }
    )
  }
}

// 获取转盘的抽奖记录
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const wheelId = searchParams.get('wheelId')

    if (!wheelId) {
      return NextResponse.json(
        { error: '缺少转盘ID' },
        { status: 400 }
      )
    }

    const drawRecords = await prisma.drawRecord.findMany({
      where: { wheelId },
      include: {
        prize: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    })

    return NextResponse.json({ drawRecords })
  } catch (error) {
    console.error('获取抽奖记录错误:', error)
    return NextResponse.json(
      { error: '获取抽奖记录失败' },
      { status: 500 }
    )
  }
}

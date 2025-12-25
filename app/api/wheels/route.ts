import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { nanoid } from 'nanoid'

const createWheelSchema = z.object({
  name: z.string().min(1, '转盘名称不能为空').max(100, '转盘名称最多100个字符'),
  description: z.string().optional(),
  type: z.enum(['wheel', 'box', 'number', 'list']).default('wheel'),
  isUniform: z.boolean().default(false),
  prizes: z.array(z.object({
    name: z.string().min(1, '奖品名称不能为空'),
    weight: z.number().int().min(0),
    imageUrl: z.string().optional(),
    order: z.number().int().default(0),
  })).optional(),
  // 数字抽奖配置
  numberMin: z.number().int().optional(),
  numberMax: z.number().int().optional(),
  // 名单抽奖配置
  participants: z.array(z.string()).optional(),
})

// 获取用户的所有转盘
export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      )
    }

    const wheels = await prisma.wheel.findMany({
      where: { userId: user.userId },
      include: {
        prizes: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { drawRecords: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ wheels })
  } catch (error) {
    console.error('获取转盘列表错误:', error)
    return NextResponse.json(
      { error: '获取转盘列表失败' },
      { status: 500 }
    )
  }
}

// 创建新转盘
export async function POST(request: Request) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // 验证输入
    const validationResult = createWheelSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, description, type, isUniform, prizes, numberMin, numberMax, participants } = validationResult.data

    // 根据类型验证必要字段
    if ((type === 'wheel' || type === 'box') && (!prizes || prizes.length === 0)) {
      return NextResponse.json(
        { error: '转盘抽奖和暗箱抽奖至少需要一个奖品' },
        { status: 400 }
      )
    }

    if (type === 'number' && (numberMin === undefined || numberMax === undefined)) {
      return NextResponse.json(
        { error: '数字抽奖需要设置最小值和最大值' },
        { status: 400 }
      )
    }

    if (type === 'number' && numberMin! >= numberMax!) {
      return NextResponse.json(
        { error: '最小值必须小于最大值' },
        { status: 400 }
      )
    }

    if (type === 'list' && (!participants || participants.length === 0)) {
      return NextResponse.json(
        { error: '名单抽奖需要至少一个参与人' },
        { status: 400 }
      )
    }

    // 生成唯一的分享码
    const shareCode = nanoid(10)

    // 创建转盘和奖品
    const wheel = await prisma.wheel.create({
      data: {
        name,
        description,
        type,
        isUniform,
        shareCode,
        userId: user.userId,
        numberMin: type === 'number' ? numberMin : undefined,
        numberMax: type === 'number' ? numberMax : undefined,
        participants: type === 'list' && participants ? JSON.stringify(participants) : undefined,
        prizes: (type === 'wheel' || type === 'box') && prizes ? {
          create: prizes.map((prize, index) => ({
            ...prize,
            order: prize.order || index,
          })),
        } : undefined,
      },
      include: {
        prizes: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json({ wheel })
  } catch (error) {
    console.error('创建转盘错误:', error)
    return NextResponse.json(
      { error: '创建转盘失败' },
      { status: 500 }
    )
  }
}

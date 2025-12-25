import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateWheelSchema = z.object({
  name: z.string().min(1, '转盘名称不能为空').max(100, '转盘名称最多100个字符').optional(),
  description: z.string().optional(),
  isUniform: z.boolean().optional(),
  prizes: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, '奖品名称不能为空'),
    weight: z.number().int().min(0),
    imageUrl: z.string().optional(),
    order: z.number().int().default(0),
  })).optional(),
})

// 获取单个转盘
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      )
    }

    const wheel = await prisma.wheel.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
      include: {
        prizes: {
          orderBy: { order: 'asc' },
        },
        drawRecords: {
          include: {
            prize: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 50,
        },
      },
    })

    if (!wheel) {
      return NextResponse.json(
        { error: '转盘不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({ wheel })
  } catch (error) {
    console.error('获取转盘错误:', error)
    return NextResponse.json(
      { error: '获取转盘失败' },
      { status: 500 }
    )
  }
}

// 更新转盘
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      )
    }

    // 验证转盘所有权
    const existingWheel = await prisma.wheel.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
    })

    if (!existingWheel) {
      return NextResponse.json(
        { error: '转盘不存在' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // 验证输入
    const validationResult = updateWheelSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, description, isUniform, prizes } = validationResult.data

    // 更新转盘
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (isUniform !== undefined) updateData.isUniform = isUniform

    // 如果有奖品更新，先删除旧奖品，再创建新奖品
    if (prizes !== undefined) {
      await prisma.prize.deleteMany({
        where: { wheelId: params.id },
      })

      updateData.prizes = {
        create: prizes.map((prize, index) => ({
          name: prize.name,
          weight: prize.weight,
          imageUrl: prize.imageUrl,
          order: prize.order || index,
        })),
      }
    }

    const wheel = await prisma.wheel.update({
      where: { id: params.id },
      data: updateData,
      include: {
        prizes: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json({ wheel })
  } catch (error) {
    console.error('更新转盘错误:', error)
    return NextResponse.json(
      { error: '更新转盘失败' },
      { status: 500 }
    )
  }
}

// 删除转盘
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      )
    }

    // 验证转盘所有权
    const existingWheel = await prisma.wheel.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
    })

    if (!existingWheel) {
      return NextResponse.json(
        { error: '转盘不存在' },
        { status: 404 }
      )
    }

    // 删除转盘（级联删除奖品和记录）
    await prisma.wheel.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除转盘错误:', error)
    return NextResponse.json(
      { error: '删除转盘失败' },
      { status: 500 }
    )
  }
}

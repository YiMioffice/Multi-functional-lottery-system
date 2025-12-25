import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 通过分享码获取转盘（公开访问，无需认证）
export async function GET(
  request: Request,
  { params }: { params: { shareCode: string } }
) {
  try {
    const wheel = await prisma.wheel.findUnique({
      where: { shareCode: params.shareCode },
      include: {
        prizes: {
          orderBy: { order: 'asc' },
        },
        user: {
          select: {
            username: true,
          },
        },
      },
    })

    if (!wheel) {
      return NextResponse.json(
        { error: '转盘不存在或已被删除' },
        { status: 404 }
      )
    }

    return NextResponse.json({ wheel })
  } catch (error) {
    console.error('获取分享转盘错误:', error)
    return NextResponse.json(
      { error: '获取转盘失败' },
      { status: 500 }
    )
  }
}

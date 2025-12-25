import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 获取所有转盘（仅管理员）
export async function GET(request: Request) {
  try {
    const user = getUserFromRequest(request)

    if (!user) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      )
    }

    // 验证管理员权限
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足，仅管理员可访问' },
        { status: 403 }
      )
    }

    const wheels = await prisma.wheel.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
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

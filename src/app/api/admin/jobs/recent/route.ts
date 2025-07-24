import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get recent jobs with application count
    const recentJobs = await prisma.job.findMany({
      where: { createdBy: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        _count: {
          select: { applications: true }
        }
      }
    })

    return NextResponse.json(recentJobs)

  } catch (error) {
    console.error('Recent jobs API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

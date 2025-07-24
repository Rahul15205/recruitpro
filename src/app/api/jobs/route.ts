import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get all active jobs for public viewing
    const jobs = await prisma.job.findMany({
      where: { 
        status: 'ACTIVE' 
      },
      orderBy: { 
        createdAt: 'desc' 
      },
      include: {
        _count: {
          select: { applications: true }
        }
      }
    })

    return NextResponse.json(jobs)

  } catch (error) {
    console.error('Get public jobs error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const job = await prisma.job.findUnique({
      where: { 
        id: id,
        status: 'ACTIVE' // Only show active jobs to public
      },
      include: {
        _count: {
          select: { applications: true }
        }
      }
    })

    if (!job) {
      return NextResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(job)

  } catch (error) {
    console.error('Get job detail error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

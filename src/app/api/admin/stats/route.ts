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

    // Get dashboard statistics
    const [totalJobs, activeJobs, closedJobs, totalApplications, pendingApplications] = await Promise.all([
      prisma.job.count({
        where: { createdBy: session.user.id }
      }),
      prisma.job.count({
        where: { 
          createdBy: session.user.id,
          status: 'ACTIVE' 
        }
      }),
      prisma.job.count({
        where: { 
          createdBy: session.user.id,
          status: 'CLOSED' 
        }
      }),
      prisma.application.count({
        where: {
          job: {
            createdBy: session.user.id
          }
        }
      }),
      prisma.application.count({
        where: {
          job: {
            createdBy: session.user.id
          },
          status: 'PENDING'
        }
      })
    ])

    return NextResponse.json({
      totalJobs,
      activeJobs,
      closedJobs,
      totalApplications,
      pendingApplications
    })

  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

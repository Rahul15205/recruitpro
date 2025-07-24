import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client';
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const jobId = searchParams.get('jobId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build where clause for filtering
    const where: Record<string, unknown> = {};    
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }
    
    if (jobId && jobId !== 'all') {
      where.jobId = jobId
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { job: { title: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Get total count for pagination
    const total = await prisma.application.count({ where })

    // Fetch applications with related data
    const applications = await prisma.application.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileInfo: true
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            location: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    // Format the response to match the frontend interface
    const formattedApplications = applications.map((app: typeof applications[number]) => ({
      id: app.id,
      jobId: app.jobId,
      jobTitle: app.job.title,
      candidateName: app.user.name || 'Unknown',
      candidateEmail: app.user.email,
      appliedAt: app.createdAt.toISOString(),
      status: app.status.toLowerCase(),
      resume: app.resumeUrl,
      coverLetter: null, // Not implemented yet
      experience: app.user.profileInfo?.experience || 'Not specified',
      location: app.user.profileInfo?.location || app.job.location || 'Not specified',
      notes: app.notes
    }))

    return NextResponse.json({
      applications: formattedApplications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get applications error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { applicationId, status, notes } = await request.json()

    if (!applicationId || !status) {
      return NextResponse.json(
        { message: 'Application ID and status are required' },
        { status: 400 }
      )
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: status.toUpperCase(),
        notes: notes || undefined,
        updatedAt: new Date()
      }
    })

    // Create action log
    await prisma.actionLog.create({
      data: {
        applicationId: applicationId,
        action: status.toUpperCase(),
        performedBy: session.user.id
      }
    })

    return NextResponse.json({
      message: 'Application status updated successfully',
      application: {
        id: updatedApplication.id,
        status: updatedApplication.status.toLowerCase()
      }
    })

  } catch (error) {
    console.error('Update application status error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createJobSchema = z.object({
  title: z.string().min(2),
  department: z.string().min(2),
  location: z.string().min(2),
  salary: z.string().optional(),
  description: z.string().min(10),
  requirements: z.string().optional(),
  customFields: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const jobData = createJobSchema.parse(body)

    // Parse custom fields if provided
    let customFields = null
    if (jobData.customFields) {
      try {
        customFields = JSON.parse(jobData.customFields)
      } catch (error) {
        return NextResponse.json(
          { message: 'Invalid JSON in custom fields' },
          { status: 400 }
        )
      }
    }

    // Create the job
    const job = await prisma.job.create({
      data: {
        title: jobData.title,
        department: jobData.department,
        location: jobData.location,
        salary: jobData.salary || null,
        description: jobData.description,
        requirements: jobData.requirements || null,
        customFields: customFields,
        createdBy: session.user.id,
        requiresResume: true, // Default to requiring resume
        status: 'ACTIVE'
      }
    })

    return NextResponse.json({
      message: 'Job created successfully',
      job
    })

  } catch (error) {
    console.error('Create job error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all jobs created by this admin
    const jobs = await prisma.job.findMany({
      where: { createdBy: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { applications: true }
        }
      }
    })

    return NextResponse.json(jobs)

  } catch (error) {
    console.error('Get jobs error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { message: 'Application ID is required' },
        { status: 400 }
      )
    }

    const application = await prisma.application.findUnique({
      where: { id },
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
            location: true,
            customFields: true
          }
        },
        actionLogs: {
          include: {
            application: {
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json(
        { message: 'Application not found' },
        { status: 404 }
      )
    }

    let customResponses: { question: string; answer: string }[] | null = null
    if (application.answers && application.job.customFields) {
      try {
        const answers = application.answers as Record<string, string>
        const customFields = application.job.customFields as Array<{ id: string; name?: string; question?: string; label?: string }>
        if (Array.isArray(customFields) && typeof answers === 'object') {
          customResponses = customFields.map((field) => ({
            question: field.question || field.label || '',
            answer: answers[field.id] || (field.name ? answers[field.name] : '') || 'No answer provided'
          }))
        }
      } catch (error) {
        console.error('Error parsing custom responses:', error)
      }
    }

    type Note = { id: string; content: string; createdAt: string; author: string }
    let notes: Note[] = []
    if (application.notes) {
      try {
        const applicationNotes = application.notes as Note[]
        if (Array.isArray(applicationNotes)) {
          notes = applicationNotes.map(note => ({
            id: note.id,
            content: note.content,
            createdAt: note.createdAt,
            author: note.author
          }))
        }
      } catch (error) {
        console.error('Error parsing notes:', error)
      }
    }
    
    type ActionLog = { id: string; action: string; timestamp: Date }
    const actionLogNotes: Note[] = application.actionLogs.map((log: ActionLog) => ({
      id: `log_${log.id}`,
      content: `Status changed to ${String(log.action).toLowerCase()}`,
      createdAt: log.timestamp.toISOString(),
      author: 'System'
    }))
    
    const allNotes: Note[] = [...notes, ...actionLogNotes].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    const formattedApplication = {
      id: application.id,
      jobId: application.jobId,
      jobTitle: application.job.title,
      jobDepartment: application.job.department,
      candidateName: application.user.name || 'Unknown',
      candidateEmail: application.user.email,
      candidatePhone: application.user.profileInfo?.phone || null,
      candidateLocation: application.user.profileInfo?.location || application.job.location || 'Not specified',
      appliedAt: application.createdAt.toISOString(),
      status: application.status.toLowerCase(),
      resume: application.resumeUrl,
      resumePreviewUrl: application.resumePreviewUrl,
      coverLetter: application.user.profileInfo?.coverLetter || null,
      experience: application.user.profileInfo?.experience || 'Not specified',
      previousRole: application.user.profileInfo?.previousRole || null,
      currentCompany: application.user.profileInfo?.currentCompany || null,
      expectedSalary: application.user.profileInfo?.expectedSalary || null,
      availabilityDate: application.user.profileInfo?.availabilityDate || null,
      customResponses: customResponses,
      notes: allNotes
    }

    return NextResponse.json(formattedApplication)

  } catch (error) {
    console.error('Get application error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

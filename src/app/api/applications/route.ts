import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'APPLICANT') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const jobId = formData.get('jobId') as string
    const answersString = formData.get('answers') as string
    const resumeFile = formData.get('resume') as File

    if (!jobId) {
      return NextResponse.json(
        { message: 'Job ID is required' },
        { status: 400 }
      )
    }

    // Check if job exists and is active
    const job = await prisma.job.findUnique({
      where: { id: jobId, status: 'ACTIVE' }
    })

    if (!job) {
      return NextResponse.json(
        { message: 'Job not found or not active' },
        { status: 404 }
      )
    }

    // Check if user already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_jobId: {
          userId: session.user.id,
          jobId: jobId
        }
      }
    })

    if (existingApplication) {
      return NextResponse.json(
        { message: 'You have already applied to this job' },
        { status: 400 }
      )
    }

    // Parse answers
    let answers = null
    if (answersString) {
      try {
        answers = JSON.parse(answersString)
      } catch (error) {
        console.error('Error parsing answers:', error)
      }
    }

    // For now, we'll store a placeholder for resume URL
    // In a real app, you'd upload to Cloudinary/S3
    let resumePreviewUrl = null
    if (resumeFile && resumeFile.size > 0) {
      // Only allow PDF
      if (resumeFile.type !== 'application/pdf') {
        return NextResponse.json(
          { message: 'Only PDF files are allowed' },
          { status: 400 }
        )
      }
      // Read file buffer
      const arrayBuffer = await resumeFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      try {
        // Upload the first page of the PDF as an image for preview
        const previewResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'image',
              folder: 'resumes/previews',
              public_id: `resume_preview_${session.user.id}_${Date.now()}`,
              format: 'jpg',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(buffer); // Cloudinary will extract the first page as an image
        });
        // @ts-expect-error
        resumePreviewUrl = previewResult.secure_url;
      } catch (err) {
        console.error('Cloudinary upload error:', err);
        return NextResponse.json(
          { message: 'Failed to upload resume. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        jobId: jobId,
        answers: answers,
        resumePreviewUrl: resumePreviewUrl,
        status: 'PENDING'
      }
    })

    // Create action log
    await prisma.actionLog.create({
      data: {
        applicationId: application.id,
        action: 'APPLIED',
        performedBy: session.user.id
      }
    })

    return NextResponse.json({
      message: 'Application submitted successfully',
      application: {
        id: application.id,
        status: application.status,
        createdAt: application.createdAt
      }
    })

  } catch (error) {
    console.error('Submit application error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Fetch application with resume info
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        job: {
          select: {
            title: true
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

    if (!application.resumeUrl) {
      return NextResponse.json(
        { message: 'No resume found for this application' },
        { status: 404 }
      )
    }

    let fileUrl = application.resumeUrl
    let filename = `${application.user.name}_Resume.pdf`
    
    try {
      // If resumeUrl is a full URL (from cloud storage like Cloudinary, S3, etc.)
      if (application.resumeUrl.startsWith('http')) {
        // Fetch the file from the external URL (Cloudinary)
        const fileResponse = await fetch(application.resumeUrl)
        if (!fileResponse.ok) {
          throw new Error('Failed to fetch resume from storage')
        }
        // Get the file content as a Buffer for binary safety
        const fileBuffer = Buffer.from(await fileResponse.arrayBuffer())
        // Extract filename from URL or use default
        const urlParts = application.resumeUrl.split('/')
        const urlFilename = urlParts[urlParts.length - 1]
        if (urlFilename && urlFilename.includes('.')) {
          filename = urlFilename
        }
        // Always set PDF content type for resumes
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': fileBuffer.length.toString()
          }
        })
      } else {
        // Fallback for development/testing only if resumeUrl is not a URL
        const pdfContent = generateSamplePDF(application)
        return new NextResponse(pdfContent, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': pdfContent.length.toString()
          }
        })
      }
    } catch (error) {
      console.error('Error fetching resume file:', error)
      // Fallback: return a generated PDF with candidate info
      const fallbackPDF = generateSamplePDF(application)
      return new NextResponse(fallbackPDF, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': fallbackPDF.length.toString()
        }
      })
    }

  } catch (error) {
    console.error('Download resume error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Simple fallback PDF generator for development/testing
function generateSamplePDF(application: any): Uint8Array {
  // This is just a placeholder. In production, use a real PDF generator.
  const text = `Resume not found for ${application.user.name}\nEmail: ${application.user.email}\nJob: ${application.job.title}`;
  // Return as a PDF-like buffer (not a real PDF)
  return new TextEncoder().encode(text);
}

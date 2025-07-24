import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Add a note to an application
export async function POST(
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
    const { content } = await request.json()

    if (!id) {
      return NextResponse.json(
        { message: 'Application ID is required' },
        { status: 400 }
      )
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { message: 'Note content is required' },
        { status: 400 }
      )
    }

    // Check if application exists
    const application = await prisma.application.findUnique({
      where: { id }
    })

    if (!application) {
      return NextResponse.json(
        { message: 'Application not found' },
        { status: 404 }
      )
    }

    // Update the notes field in the application
    type Note = { id: string; content: string; createdAt: string; author: string };
    const currentNotes: Note[] = application.notes
      ? (typeof application.notes === 'string'
          ? (JSON.parse(application.notes) as Note[])
          : (application.notes as Note[]))
      : [];
    const newNote = {
      id: Date.now().toString(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
      author: session.user.name || session.user.email || 'Admin'
    }

    const updatedNotes = [...currentNotes, newNote]

    // Update application with new note
    await prisma.application.update({
      where: { id },
      data: {
        notes: JSON.stringify(updatedNotes),
      }
    })

    return NextResponse.json({
      message: 'Note added successfully',
      note: newNote
    })

  } catch (error) {
    console.error('Add note error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get all notes for an application
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

    // Fetch application with notes
    const application = await prisma.application.findUnique({
      where: { id },
      select: {
        notes: true
      }
    })

    if (!application) {
      return NextResponse.json(
        { message: 'Application not found' },
        { status: 404 }
      )
    }

    type Note = { id: string; content: string; createdAt: string; author: string };
    const notes: Note[] = application.notes
      ? (typeof application.notes === 'string'
          ? (JSON.parse(application.notes) as Note[])
          : (application.notes as Note[]))
      : [];

    return NextResponse.json({
      notes: notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    })

  } catch (error) {
    console.error('Get notes error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

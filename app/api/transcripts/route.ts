import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { Session } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    if (content.length > 50000) {
      return NextResponse.json({ error: "Content is too long (max 50,000 characters)" }, { status: 400 })
    }

    const transcript = await prisma.transcript.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        userId: session.user.id,
      },
    })

    return NextResponse.json(
      {
        message: "Transcript uploaded successfully",
        transcript: {
          id: transcript.id,
          title: transcript.title,
          createdAt: transcript.createdAt,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Transcript upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const transcripts = await prisma.transcript.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            summaries: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ transcripts })
  } catch (error) {
    console.error("Fetch transcripts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

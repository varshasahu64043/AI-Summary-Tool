import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import type { Session } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions) as Session | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const summary = await prisma.summary.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        transcript: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (!summary) {
      return NextResponse.json({ error: "Summary not found" }, { status: 404 })
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("Fetch summary error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions) as Session | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    const summary = await prisma.summary.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!summary) {
      return NextResponse.json({ error: "Summary not found" }, { status: 404 })
    }

    const updatedSummary = await prisma.summary.update({
      where: {
        id: params.id,
      },
      data: {
        title: title.trim(),
        content: content.trim(),
        isEdited: true,
      },
    })

    return NextResponse.json({
      message: "Summary updated successfully",
      summary: updatedSummary,
    })
  } catch (error) {
    console.error("Update summary error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions) as Session | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const summary = await prisma.summary.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!summary) {
      return NextResponse.json({ error: "Summary not found" }, { status: 404 })
    }

    await prisma.summary.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: "Summary deleted successfully" })
  } catch (error) {
    console.error("Delete summary error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

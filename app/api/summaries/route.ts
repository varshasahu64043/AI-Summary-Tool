import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { type Session } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const transcriptId = searchParams.get("transcriptId")

    const whereClause: any = {
      userId: session.user.id,
    }

    if (transcriptId) {
      whereClause.transcriptId = transcriptId
    }

    const summaries = await prisma.summary.findMany({
      where: whereClause,
      include: {
        transcript: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ summaries })
  } catch (error) {
    console.error("Fetch summaries error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

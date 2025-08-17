import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Session } from "next-auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const summaryId = searchParams.get("summaryId")

    const whereClause: any = {
      userId: session.user.id,
    }

    if (summaryId) {
      whereClause.summaryId = summaryId
    }

    const shares = await prisma.emailShare.findMany({
      where: whereClause,
      include: {
        summary: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        sentAt: "desc",
      },
    })

    return NextResponse.json({ shares })
  } catch (error) {
    console.error("Fetch shares error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

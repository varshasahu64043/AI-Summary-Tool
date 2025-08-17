import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { Session } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get counts for user's data
    const [totalTranscripts, totalSummaries, totalShares, recentActivity] = await Promise.all([
      prisma.transcript.count({
        where: { userId: session.user.id },
      }),
      prisma.summary.count({
        where: { userId: session.user.id },
      }),
      prisma.emailShare.count({
        where: { userId: session.user.id },
      }),
      prisma.summary.count({
        where: {
          userId: session.user.id,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ])

    const stats = {
      totalTranscripts,
      totalSummaries,
      totalShares,
      recentActivity,
    }

    return NextResponse.json({ stats })
  } catch (error) {
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }
  

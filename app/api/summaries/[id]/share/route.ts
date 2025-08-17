import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { type Session } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { transporter, generateSummaryEmailHTML, generateSummaryEmailText } from "@/lib/email"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions) as Session | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { recipients, subject, message } = await request.json()

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: "At least one recipient is required" }, { status: 400 })
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = recipients.filter((email: string) => !emailRegex.test(email))
    if (invalidEmails.length > 0) {
      return NextResponse.json({ error: `Invalid email addresses: ${invalidEmails.join(", ")}` }, { status: 400 })
    }

    // Fetch the summary
    const summary = await prisma.summary.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        transcript: {
          select: {
            title: true,
          },
        },
      },
    })

    if (!summary) {
      return NextResponse.json({ error: "Summary not found" }, { status: 404 })
    }

    const senderName = session.user.name || session.user.email || "Anonymous"
    const emailSubject = subject || `Shared Summary: ${summary.title}`

    // Generate email content
    const htmlContent = generateSummaryEmailHTML(summary.title, summary.content, senderName, message)

    const textContent = generateSummaryEmailText(summary.title, summary.content, senderName, message)

    // Send emails
    const emailPromises = recipients.map((recipient: string) =>
      transporter.sendMail({
        from: process.env.SMTP_USER,
        to: recipient,
        subject: emailSubject,
        text: textContent,
        html: htmlContent,
      }),
    )

    try {
      await Promise.all(emailPromises)
    } catch (emailError) {
      console.error("Email sending error:", emailError)
      return NextResponse.json({ error: "Failed to send emails" }, { status: 500 })
    }

    // Record the email share in database
    await prisma.emailShare.create({
      data: {
        summaryId: summary.id,
        userId: session.user.id,
        recipients: JSON.stringify(recipients),
        subject: emailSubject,
        message: message || null,
      },
    })

    return NextResponse.json({
      message: `Summary shared successfully with ${recipients.length} recipient${recipients.length > 1 ? "s" : ""}`,
      recipientCount: recipients.length,
    })
  } catch (error) {
    console.error("Share summary error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

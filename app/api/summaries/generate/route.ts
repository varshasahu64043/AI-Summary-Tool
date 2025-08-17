import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { type Session } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { groq } from "@/lib/ai"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const session: Session | null = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { transcriptId, prompt, title } = await request.json()

    if (!transcriptId || !prompt) {
      return NextResponse.json({ error: "Transcript ID and prompt are required" }, { status: 400 })
    }

    // Fetch the transcript
    const transcript = await prisma.transcript.findFirst({
      where: {
        id: transcriptId,
        userId: session.user.id,
      },
    })

    if (!transcript) {
      return NextResponse.json({ error: "Transcript not found" }, { status: 404 })
    }

    // Generate summary using Groq
    const systemPrompt = `You are an AI assistant specialized in analyzing and summarizing transcripts. 
    Your task is to process the provided transcript according to the user's specific instructions.
    
    Guidelines:
    - Be concise but comprehensive
    - Maintain the original context and meaning
    - Use clear, professional language
    - Structure your response logically
    - If the prompt asks for bullet points, use proper formatting
    - If action items are requested, clearly identify responsible parties when mentioned
    - Focus on the most important and relevant information`

    const userPrompt = `Here is the transcript to analyze:

---
${transcript.content}
---

User's instruction: ${prompt}

Please provide a summary based on the instruction above.`

    const { text } = await generateText({
      model: groq!("llama-3.1-8b-instant"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.3,
    })

    // Save the summary to database
    const summary = await prisma.summary.create({
      data: {
        title: title || `Summary - ${new Date().toLocaleDateString()}`,
        content: text,
        prompt: prompt,
        transcriptId: transcriptId,
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      message: "Summary generated successfully",
      summary: {
        id: summary.id,
        title: summary.title,
        content: summary.content,
        prompt: summary.prompt,
        createdAt: summary.createdAt,
      },
    })
  } catch (error) {
    console.error("Summary generation error:", error)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}

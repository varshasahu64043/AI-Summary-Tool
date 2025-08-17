import { createGroq } from "@ai-sdk/groq"

let groq: ReturnType<typeof createGroq> | null = null

groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
  })

export { groq }

export const isGroqAvailable = () => {
  return process.env.GROQ_API_KEY || groq
}

export const DEFAULT_PROMPTS = [
  {
    name: "Executive Summary",
    prompt:
      "Summarize this transcript in bullet points for executives, focusing on key decisions, action items, and strategic insights.",
  },
  {
    name: "Action Items",
    prompt:
      "Extract and list all action items, tasks, and next steps mentioned in this transcript. Include who is responsible if mentioned.",
  },
  {
    name: "Key Decisions",
    prompt: "Identify and summarize all key decisions made during this meeting or conversation.",
  },
  {
    name: "Meeting Notes",
    prompt: "Create structured meeting notes with main topics discussed, decisions made, and follow-up actions.",
  },
  {
    name: "Technical Summary",
    prompt:
      "Provide a technical summary focusing on technical discussions, solutions proposed, and implementation details.",
  },
]

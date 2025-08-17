"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Loader2, AlertCircle } from "lucide-react"
import { DEFAULT_PROMPTS, isGroqAvailable } from "@/lib/ai"

interface GenerateFormProps {
  transcriptId: string
  transcriptTitle: string
  onSummaryGenerated?: (summary: any) => void
}

export function GenerateForm({ transcriptId, transcriptTitle, onSummaryGenerated }: GenerateFormProps) {
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [selectedPrompt, setSelectedPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  if (!isGroqAvailable()) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            AI Service Not Available
          </CardTitle>
          <CardDescription>
            The AI summarization service is not configured. Please add the GROQ_API_KEY environment variable.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const handlePromptSelect = (value: string) => {
    setSelectedPrompt(value)
    const defaultPrompt = DEFAULT_PROMPTS.find((p) => p.name === value)
    if (defaultPrompt) {
      setPrompt(defaultPrompt.prompt)
      if (!title) {
        setTitle(`${defaultPrompt.name} - ${transcriptTitle}`)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prompt.trim()) {
      setError("Please provide a prompt or select a template")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/summaries/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcriptId,
          prompt: prompt.trim(),
          title: title.trim() || `Summary - ${new Date().toLocaleDateString()}`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to generate summary")
        return
      }

      // Reset form
      setTitle("")
      setPrompt("")
      setSelectedPrompt("")

      // Call success callback
      onSummaryGenerated?.(data.summary)
    } catch (error) {
      setError("An error occurred while generating the summary")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Generate AI Summary
        </CardTitle>
        <CardDescription>Create a structured summary using AI with your custom instructions</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Summary Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Executive Summary - Weekly Team Meeting"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt-template">Quick Templates</Label>
            <Select value={selectedPrompt} onValueChange={handlePromptSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template or write custom prompt below" />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_PROMPTS.map((template) => (
                  <SelectItem key={template.name} value={template.name}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Custom Instructions</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Summarize in bullet points for executives, focusing on key decisions and action items..."
              className="min-h-[120px]"
              required
            />
            <p className="text-sm text-gray-500">Be specific about the format and focus you want for your summary</p>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

          <Button type="submit" className="w-full" disabled={isLoading || !prompt.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Summary...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Summary
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

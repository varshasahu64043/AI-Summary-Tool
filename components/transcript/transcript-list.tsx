"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Transcript {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  _count: {
    summaries: number
  }
}

interface TranscriptListProps {
  onSelectTranscript?: (transcriptId: string) => void
  refreshTrigger?: number
}

export function TranscriptList({ onSelectTranscript, refreshTrigger }: TranscriptListProps) {
  const { data: session } = useSession()
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchTranscripts = async () => {
    if (!session?.user?.email) return

    try {
      const response = await fetch("/api/transcripts")
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to fetch transcripts")
        return
      }

      setTranscripts(data.transcripts)
    } catch (error) {
      setError("An error occurred while fetching transcripts")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTranscripts()
  }, [session, refreshTrigger])

  const handleDelete = async (transcriptId: string) => {
    if (!confirm("Are you sure you want to delete this transcript?")) return

    try {
      const response = await fetch(`/api/transcripts/${transcriptId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setTranscripts(transcripts.filter((t) => t.id !== transcriptId))
      }
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading transcripts...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>
  }

  if (transcripts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No transcripts uploaded yet</p>
          <p className="text-sm text-gray-400">Upload your first transcript to get started</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {transcripts.map((transcript) => (
        <Card key={transcript.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{transcript.title}</CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDistanceToNow(new Date(transcript.createdAt), { addSuffix: true })}
                  </span>
                  {transcript._count.summaries > 0 && (
                    <Badge variant="secondary">
                      {transcript._count.summaries} {transcript._count.summaries === 1 ? "summary" : "summaries"}
                    </Badge>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onSelectTranscript?.(transcript.id)}>
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(transcript.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

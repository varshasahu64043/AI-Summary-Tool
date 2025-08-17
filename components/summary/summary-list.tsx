"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, Edit, Trash2, Sparkles } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { SummaryEditor } from "./summary-editor"
import { ShareDialog } from "./share-dialog"

interface Summary {
  id: string
  title: string
  content: string
  prompt: string
  isEdited: boolean
  createdAt: string
  transcript: {
    id: string
    title: string
  }
}

interface SummaryListProps {
  transcriptId?: string
  refreshTrigger?: number
  onShare?: (summary: Summary) => void
}

export function SummaryList({ transcriptId, refreshTrigger, onShare }: SummaryListProps) {
  const { data: session } = useSession()
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingSummary, setEditingSummary] = useState<string | null>(null)

  const fetchSummaries = async () => {
    // Access the id safely, as it's not in the default NextAuth types
    const userId = session?.user?.email
    if (!userId) return

    try {
      const url = transcriptId ? `/api/summaries?transcriptId=${transcriptId}` : "/api/summaries"

      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to fetch summaries")
        return
      }

      setSummaries(data.summaries)
    } catch (error) {
      setError("An error occurred while fetching summaries")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSummaries()
  }, [session, transcriptId, refreshTrigger])

  const handleEdit = (summaryId: string) => {
    setEditingSummary(summaryId)
  }

  const handleSaveEdit = (updatedSummary: Summary) => {
    setSummaries(summaries.map((s) => (s.id === updatedSummary.id ? updatedSummary : s)))
    setEditingSummary(null)
  }

  const handleCancelEdit = () => {
    setEditingSummary(null)
  }

  const handleDelete = async (summaryId: string) => {
    if (!confirm("Are you sure you want to delete this summary?")) return

    try {
      const response = await fetch(`/api/summaries/${summaryId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSummaries(summaries.filter((s) => s.id !== summaryId))
      }
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading summaries...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>
  }

  if (summaries.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No summaries generated yet</p>
          <p className="text-sm text-gray-400">Generate your first AI summary from a transcript</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {summaries.map((summary) => (
        <div key={summary.id}>
          {editingSummary === summary.id ? (
            <SummaryEditor summary={summary} onSave={handleSaveEdit} onCancel={handleCancelEdit} />
          ) : (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{summary.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDistanceToNow(new Date(summary.createdAt), { addSuffix: true })}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {summary.transcript.title}
                      </span>
                      {summary.isEdited && <Badge variant="secondary">Edited</Badge>}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(summary.id)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <ShareDialog summary={summary} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(summary.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Prompt Used:</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md italic">"{summary.prompt}"</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Summary:</h4>
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-gray-900 bg-white p-4 border rounded-md">
                        {summary.content.length > 400 ? summary.content.substring(0, 400) + "..." : summary.content}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ))}
    </div>
  )
}

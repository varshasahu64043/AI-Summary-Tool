"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Save, X, Edit, Undo, FileText } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

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

interface SummaryEditorProps {
  summary: Summary
  onSave?: (updatedSummary: Summary) => void
  onCancel?: () => void
}

export function SummaryEditor({ summary, onSave, onCancel }: SummaryEditorProps) {
  const [title, setTitle] = useState(summary.title)
  const [content, setContent] = useState(summary.content)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [hasChanges, setHasChanges] = useState(false)

  // Track changes
  useEffect(() => {
    const titleChanged = title !== summary.title
    const contentChanged = content !== summary.content
    setHasChanges(titleChanged || contentChanged)
  }, [title, content, summary.title, summary.content])

  const handleSave = async () => {
    if (!hasChanges) {
      onCancel?.()
      return
    }

    if (!title.trim() || !content.trim()) {
      setError("Title and content cannot be empty")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/summaries/${summary.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to save changes")
        return
      }

      // Call success callback with updated summary
      onSave?.(data.summary)
    } catch (error) {
      setError("An error occurred while saving")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setTitle(summary.title)
    setContent(summary.content)
    setError("")
  }

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to cancel?")) {
        onCancel?.()
      }
    } else {
      onCancel?.()
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Summary
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {summary.transcript.title}
              </span>
              <span>Created {formatDistanceToNow(new Date(summary.createdAt), { addSuffix: true })}</span>
              {summary.isEdited && <Badge variant="secondary">Previously Edited</Badge>}
              {hasChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Unsaved Changes
                </Badge>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} disabled={!hasChanges}>
              <Undo className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="edit-title">Title</Label>
          <Input
            id="edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summary title..."
            className="text-lg font-medium"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="original-prompt">Original Prompt</Label>
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md italic border">"{summary.prompt}"</div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-content">Summary Content</Label>
          <Textarea
            id="edit-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Edit your summary content..."
            className="min-h-[300px] font-mono text-sm leading-relaxed"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Use plain text formatting</span>
            <span>{content.length} characters</span>
          </div>
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{error}</div>}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">{hasChanges ? "You have unsaved changes" : "No changes made"}</div>
          <Button onClick={handleSave} disabled={isLoading || !hasChanges} className="min-w-[120px]">
            {isLoading ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

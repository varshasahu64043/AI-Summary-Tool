"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Share, Calendar, FileText, Copy, Check } from "lucide-react"
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

interface SummaryViewerProps {
  summary: Summary
  onEdit?: (summary: Summary) => void
  onShare?: (summary: Summary) => void
}

export function SummaryViewer({ summary, onEdit, onShare }: SummaryViewerProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{summary.title}</CardTitle>
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
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={() => onEdit?.(summary)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button variant="default" size="sm" onClick={() => onShare?.(summary)}>
              <Share className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Original Prompt:</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md italic border">"{summary.prompt}"</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Summary Content:</h4>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-900 bg-white p-6 border rounded-lg leading-relaxed">
              {summary.content}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

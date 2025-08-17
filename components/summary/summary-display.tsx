"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Share, Calendar, FileText } from "lucide-react"
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

interface SummaryDisplayProps {
  summary: Summary
  onEdit?: (summary: Summary) => void
  onShare?: (summary: Summary) => void
}

export function SummaryDisplay({ summary, onEdit, onShare }: SummaryDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const contentPreview = summary.content.length > 300 ? summary.content.substring(0, 300) + "..." : summary.content

  return (
    <Card className="w-full">
      <CardHeader>
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
            <Button variant="outline" size="sm" onClick={() => onEdit?.(summary)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => onShare?.(summary)}>
              <Share className="h-4 w-4 mr-1" />
              Share
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
            <h4 className="text-sm font-medium text-gray-700 mb-2">Generated Summary:</h4>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-900">{isExpanded ? summary.content : contentPreview}</div>
              {summary.content.length > 300 && (
                <Button variant="link" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="p-0 h-auto mt-2">
                  {isExpanded ? "Show less" : "Show more"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

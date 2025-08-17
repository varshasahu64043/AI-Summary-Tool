"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Calendar, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface EmailShare {
  id: string
  recipients: string
  subject: string
  message: string | null
  sentAt: string
  summary: {
    id: string
    title: string
  }
}

interface ShareHistoryProps {
  summaryId?: string
}

export function ShareHistory({ summaryId }: ShareHistoryProps) {
  const { data: session } = useSession()
  const [shares, setShares] = useState<EmailShare[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchShares = async () => {
      if (!session?.user?.email) return

      try {
        const url = summaryId ? `/api/shares?summaryId=${summaryId}` : "/api/shares"
        const response = await fetch(url)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "Failed to fetch share history")
          return
        }

        setShares(data.shares)
      } catch (error) {
        setError("An error occurred while fetching share history")
      } finally {
        setIsLoading(false)
      }
    }

    fetchShares()
  }, [session, summaryId])

  if (isLoading) {
    return <div className="text-center py-4">Loading share history...</div>
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">{error}</div>
  }

  if (shares.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <Mail className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No summaries shared yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Share History</h3>
      {shares.map((share) => {
        const recipients = JSON.parse(share.recipients) as string[]
        return (
          <Card key={share.id} className="hover:shadow-sm transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{share.subject}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(share.sentAt), { addSuffix: true })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {recipients.length} recipient{recipients.length > 1 ? "s" : ""}
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {recipients.map((email) => (
                    <Badge key={email} variant="outline" className="text-xs">
                      {email}
                    </Badge>
                  ))}
                </div>
                {share.message && (
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded italic">"{share.message}"</p>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

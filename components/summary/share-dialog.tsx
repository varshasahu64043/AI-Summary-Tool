"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Share, Mail, X, Plus, Send } from "lucide-react"

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

interface ShareDialogProps {
  summary: Summary
  trigger?: React.ReactNode
}

export function ShareDialog({ summary, trigger }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [recipients, setRecipients] = useState<string[]>([])
  const [currentEmail, setCurrentEmail] = useState("")
  const [subject, setSubject] = useState(`Shared Summary: ${summary.title}`)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const addRecipient = () => {
    const email = currentEmail.trim()
    if (!email) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    if (recipients.includes(email)) {
      setError("This email is already added")
      return
    }

    setRecipients([...recipients, email])
    setCurrentEmail("")
    setError("")
  }

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter((r) => r !== email))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addRecipient()
    }
  }

  const handleShare = async () => {
    if (recipients.length === 0) {
      setError("Please add at least one recipient")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`/api/summaries/${summary.id}/share`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients,
          subject: subject.trim(),
          message: message.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to share summary")
        return
      }

      setSuccess(data.message)

      // Reset form after successful share
      setTimeout(() => {
        setRecipients([])
        setCurrentEmail("")
        setSubject(`Shared Summary: ${summary.title}`)
        setMessage("")
        setSuccess("")
        setIsOpen(false)
      }, 2000)
    } catch (error) {
      setError("An error occurred while sharing")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-1" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Share Summary via Email
          </DialogTitle>
          <DialogDescription>Send "{summary.title}" to others via email</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="email-input">Recipients</Label>
            <div className="flex gap-2">
              <Input
                id="email-input"
                type="email"
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter email address..."
                className="flex-1"
              />
              <Button type="button" onClick={addRecipient} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {recipients.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {recipients.map((email) => (
                  <Badge key={email} variant="secondary" className="flex items-center gap-1">
                    {email}
                    <button type="button" onClick={() => removeRecipient(email)} className="ml-1 hover:text-red-600">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message to include with the summary..."
              className="min-h-[80px]"
            />
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

          {success && <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{success}</div>}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleShare} disabled={isLoading || recipients.length === 0}>
              {isLoading ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email{recipients.length > 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

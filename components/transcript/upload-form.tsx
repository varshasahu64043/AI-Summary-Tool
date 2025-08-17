"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText } from "lucide-react"

interface UploadFormProps {
  onUploadSuccess?: (transcriptId: string) => void
}

export function UploadForm({ onUploadSuccess }: UploadFormProps) {
  const { data: session } = useSession()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type === "text/plain" || selectedFile.name.endsWith(".txt")) {
        setFile(selectedFile)
        setError("")

        // Read file content
        const reader = new FileReader()
        reader.onload = (event) => {
          const text = event.target?.result as string
          setContent(text)
          if (!title) {
            setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""))
          }
        }
        reader.readAsText(selectedFile)
      } else {
        setError("Please select a .txt file")
        setFile(null)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user) {
      setError("You must be logged in to upload transcripts")
      return
    }

    if (!title.trim() || !content.trim()) {
      setError("Please provide both a title and content")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/transcripts", {
        method: "POST",
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
        setError(data.error || "Failed to upload transcript")
        return
      }

      // Reset form
      setTitle("")
      setContent("")
      setFile(null)

      // Call success callback
      onUploadSuccess?.(data.transcript.id)
    } catch (error) {
      setError("An error occurred while uploading")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload Transcript
        </CardTitle>
        <CardDescription>
          Upload a text file or paste your meeting notes, call transcript, or any text content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Weekly Team Meeting - Jan 15"
              required
            />
          </div>

          <Tabs defaultValue="paste" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paste">Paste Text</TabsTrigger>
              <TabsTrigger value="upload">Upload File</TabsTrigger>
            </TabsList>

            <TabsContent value="paste" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your transcript content here..."
                  className="min-h-[200px]"
                  required
                />
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Upload Text File</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="file"
                    type="file"
                    accept=".txt,text/plain"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">Only .txt files are supported</p>
              </div>

              {content && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[150px]"
                    placeholder="File content will appear here..."
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

          <Button type="submit" className="w-full" disabled={isLoading || !content.trim()}>
            {isLoading ? "Uploading..." : "Upload Transcript"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

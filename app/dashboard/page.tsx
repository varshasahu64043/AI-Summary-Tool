"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, Upload, FileText, Sparkles } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { UploadForm } from "@/components/transcript/upload-form"
import { TranscriptList } from "@/components/transcript/transcript-list"
import { SummaryList } from "@/components/summary/summary-list"
import { ShareHistory } from "@/components/summary/share-history"
import { ErrorBoundary } from "react-error-boundary";
import { GenerateForm } from "@/components/summary/generate-form"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedTranscript, setSelectedTranscript] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleUploadSuccess = (transcriptId: string) => {
    setRefreshTrigger((prev) => prev + 1)
    setSelectedTranscript(transcriptId)
    setActiveTab("transcripts")
  }

  const handleSummaryGenerated = () => {
    setRefreshTrigger((prev) => prev + 1)
    setActiveTab("summaries")
  }

  const handleSelectTranscript = (transcriptId: string) => {
    setSelectedTranscript(transcriptId)
    setActiveTab("generate")
  }

  return (
    <ErrorBoundary fallback={<div className="p-8 text-red-600">Something went wrong. Please reload.</div>}>
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Transform your transcripts into actionable summaries with AI</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="transcripts">Transcripts</TabsTrigger>
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="summaries">Summaries</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <StatsOverview />

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Quick Actions</h2>
                <div className="grid gap-3">
                  <Button onClick={() => setActiveTab("upload")} className="justify-start h-auto p-4">
                    <Upload className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Upload Transcript</div>
                      <div className="text-sm opacity-90">Add a new document to summarize</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("transcripts")}
                    className="justify-start h-auto p-4"
                  >
                    <FileText className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">View Transcripts</div>
                      <div className="text-sm text-gray-600">Browse your uploaded documents</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("summaries")}
                    className="justify-start h-auto p-4"
                  >
                    <Sparkles className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">View Summaries</div>
                      <div className="text-sm text-gray-600">See your AI-generated summaries</div>
                    </div>
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Recent Activity</h2>
                <ShareHistory />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Upload Transcript</h2>
            </div>
            <UploadForm onUploadSuccess={handleUploadSuccess} />
          </TabsContent>

          <TabsContent value="transcripts" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Your Transcripts</h2>
              <Button onClick={() => setActiveTab("upload")}>
                <Plus className="h-4 w-4 mr-2" />
                Upload New
              </Button>
            </div>
            <TranscriptList onSelectTranscript={handleSelectTranscript} refreshTrigger={refreshTrigger} />
          </TabsContent>

          <TabsContent value="generate" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Generate AI Summary</h2>
            </div>
            {selectedTranscript ? (
              <GenerateForm
                transcriptId={selectedTranscript}
                transcriptTitle="Selected Transcript"
                onSummaryGenerated={handleSummaryGenerated}
              />
            ) : (
              <div className="text-center py-12">
                <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Transcript</h3>
                <p className="text-gray-600 mb-4">Choose a transcript from your library to generate a summary</p>
                <Button onClick={() => setActiveTab("transcripts")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Browse Transcripts
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="summaries" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">AI Summaries</h2>
              <Button onClick={() => setActiveTab("generate")}>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate New
              </Button>
            </div>
            <SummaryList refreshTrigger={refreshTrigger} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </ErrorBoundary>
  )
}

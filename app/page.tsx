"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, Download, RefreshCw, CheckCircle, AlertCircle, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ProcessingDetails {
  cropped: boolean
  background_removed: boolean
  face_detected: boolean
  size: string
  original_size_bytes: number
  processed_size_bytes: number
}

interface ApiResponse {
  success: boolean
  message: string
  processed_image_url: string
  original_filename: string
  processing_details: ProcessingDetails
  avatar_id: number
}

export default function AvatarProcessor() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      return
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file")
      return
    }

    processImage(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const processImage = async (file: File) => {
    setIsProcessing(true)
    setError(null)
    setResult(null)

    // Create URL for original image preview
    setOriginalImageUrl(URL.createObjectURL(file))

    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/process-avatar", {
        method: "POST",
        body: formData,
      })

      const data: ApiResponse = await response.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.message || "Processing failed")
      }
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadImage = async () => {
    if (!result?.processed_image_url) return

    try {
      const response = await fetch(result.processed_image_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `avatar_${result.avatar_id}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError("Failed to download image")
    }
  }

  const resetUpload = () => {
    setResult(null)
    setError(null)
    setOriginalImageUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              🎭 AI Avatar Processor
            </CardTitle>
            <p className="text-gray-600 mt-2">Upload an image and watch our AI transform it into a perfect avatar!</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Upload Area */}
            <div
              className={`border-3 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                isDragOver
                  ? "border-green-400 bg-green-50"
                  : "border-purple-300 bg-purple-50 hover:border-purple-400 hover:bg-purple-100"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="w-12 h-12 mx-auto mb-4 text-purple-500" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                📸 Drag and drop an image here or click to select
              </p>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Upload className="w-4 h-4 mr-2" />
                Choose Image
              </Button>
              <p className="text-sm text-gray-500 mt-3">Supported formats: JPG, PNG, WEBP (Max: 10MB)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
            </div>

            {/* Processing State */}
            {isProcessing && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="flex items-center justify-center p-6">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-blue-800">🤖 Processing your avatar...</p>
                    <p className="text-sm text-blue-600">
                      AI is detecting faces, removing background, and optimizing your image
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error State */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">❌ Error: {error}</AlertDescription>
              </Alert>
            )}

            {/* Results */}
            {result && (
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                  <h2 className="text-2xl font-bold text-green-600">✨ Avatar Created Successfully!</h2>
                </div>

                {/* Image Comparison */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center">Original Image</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      {originalImageUrl && (
                        <img
                          src={originalImageUrl || "/placeholder.svg"}
                          alt="Original"
                          className="max-w-full max-h-64 rounded-lg shadow-md object-contain"
                        />
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center">Processed Avatar</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      <img
                        src={result.processed_image_url || "/placeholder.svg"}
                        alt="Processed Avatar"
                        className="max-w-full max-h-64 rounded-lg shadow-md object-contain"
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                  <Button onClick={downloadImage} className="bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" />
                    Download Avatar
                  </Button>
                  <Button onClick={resetUpload} variant="outline">
                    Process Another Image
                  </Button>
                </div>

                {/* Processing Details */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-800">🔧 Processing Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="font-medium">🎯 Face Detected:</span>
                          <span
                            className={`ml-2 ${result.processing_details.face_detected ? "text-green-600" : "text-red-600"}`}
                          >
                            {result.processing_details.face_detected ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium">✂️ Image Cropped:</span>
                          <span
                            className={`ml-2 ${result.processing_details.cropped ? "text-green-600" : "text-red-600"}`}
                          >
                            {result.processing_details.cropped ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium">🌟 Background Removed:</span>
                          <span
                            className={`ml-2 ${result.processing_details.background_removed ? "text-green-600" : "text-red-600"}`}
                          >
                            {result.processing_details.background_removed ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium">📐 Output Size:</span>
                          <span className="ml-2">{result.processing_details.size || "N/A"}</span>
                        </div>
                        <div>
                          <span className="font-medium">📂 Original Filename:</span>
                          <span className="ml-2">{result.original_filename}</span>
                        </div>
                        <div>
                          <span className="font-medium">🆔 Avatar ID:</span>
                          <span className="ml-2">{result.avatar_id}</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Original Size: {formatFileSize(result.processing_details.original_size_bytes)}</span>
                        <span>Processed Size: {formatFileSize(result.processing_details.processed_size_bytes)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* API Information */}
            <Card className="bg-gray-50 border-gray-200">
              <CardHeader>
                <CardTitle className="text-center">🚀 API Endpoints</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <p>
                  <strong>Upload:</strong>{" "}
                  <code className="bg-gray-200 px-2 py-1 rounded">POST /api/process-avatar/</code>
                </p>
                <div className="flex justify-center gap-4 text-sm">
                  <a
                    href="/api/info"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    API Info
                  </a>
                  <a
                    href="/api/health"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Health Check
                  </a>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

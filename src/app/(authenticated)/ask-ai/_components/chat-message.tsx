"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PaperclipIcon, SendIcon } from "lucide-react"
import { generateOpenAI } from "@/lib/open-ai"
import { StreamingMarkdown } from "./streaming-markdown"
import { useUser } from "@/hooks/use-users"

type Message = {
  id: string
  content: string
  isUser: boolean
  isStreaming?: boolean
  file?: {
    name: string
    type: string
  } | null
}

export const ChatMessage = () => {
  const { user } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleGenerate = async () => {
    if (!inputValue.trim() && !selectedFile) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      file: selectedFile
        ? {
            name: selectedFile.name,
            type: selectedFile.type,
          }
        : null,
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue("")
    setSelectedFile(null)
    setIsGenerating(true)

    // Create AI message placeholder
    const aiMessageId = (Date.now() + 1).toString()
    const aiMessage: Message = {
      id: aiMessageId,
      content: "",
      isUser: false,
      isStreaming: true,
    }

    setMessages((prev) => [...prev, aiMessage])

    try {
      await generateOpenAI(currentInput, (chunk: string) => {
        // Update the AI message with streaming content
        setMessages((prev) =>
          prev.map((msg) => (msg.id === aiMessageId ? { ...msg, content: msg.content + chunk } : msg)),
        )
      })

      // Mark streaming as complete
      setMessages((prev) => prev.map((msg) => (msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg)))
    } catch (error) {
      console.error("Error generating response:", error)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: "Maaf, terjadi kesalahan saat menghubungi AI.",
                isStreaming: false,
              }
            : msg,
        ),
      )
    }

    setIsGenerating(false)
  }

  const handleFileAttach = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleGenerate()
    }
  }

  // Get user display name with fallbacks
  const getUserDisplayName = () => {
    if (!user) return "User"
    return user?.record?.name
  }

  if (messages.length === 0) {
    return (
      <section className="flex flex-col justify-center items-center h-screen bg-background">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-foreground mb-2">Hello, {getUserDisplayName()}</h1>
          <p className="text-muted-foreground">How can I help you today?</p>
        </div>

        <div className="w-full max-w-2xl px-4">
          <div className="relative">
            <Input
              className="border border-border pl-4 pr-20 py-4 text-base rounded-3xl shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent bg-card text-foreground"
              placeholder="Ask ai..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            {/* File Attachment Button */}
            <Button
              onClick={handleFileAttach}
              size="sm"
              variant="ghost"
              className="absolute right-12 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted rounded-full"
            >
              <PaperclipIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </Button>

            {/* Send Button */}
            <Button
              onClick={handleGenerate}
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-primary hover:bg-primary/90 rounded-full"
              disabled={!inputValue.trim() && !selectedFile}
            >
              <SendIcon className="h-4 w-4 text-primary-foreground" />
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,text/*,.pdf,.doc,.docx"
            />
          </div>

          {selectedFile && (
            <div className="mt-3 text-sm text-muted-foreground flex items-center justify-center">
              <PaperclipIcon className="h-4 w-4 mr-2" />
              <span>{selectedFile.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-6 w-6 p-0 hover:bg-muted rounded-full"
                onClick={() => setSelectedFile(null)}
              >
                ×
              </Button>
            </div>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-col h-screen bg-background">
      {/* Messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.isUser ? "justify-end" : "justify-start"}`}>
            {!message.isUser && (
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback className="bg-purple-500 text-white text-xs">AI</AvatarFallback>
              </Avatar>
            )}

            <div className={`max-w-[80%] ${message.isUser ? "order-1" : "order-2"}`}>
              <div
                className={`px-4 py-3 rounded-2xl shadow-sm border ${
                  message.isUser
                    ? "bg-primary text-primary-foreground ml-auto rounded-br-md"
                    : "bg-card text-card-foreground border-border rounded-bl-md"
                }`}
              >
                {message.isUser ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div className="text-sm leading-relaxed">
                    <StreamingMarkdown content={message.content} isStreaming={message.isStreaming} />
                  </div>
                )}

                {message.file && (
                  <div className="mt-2 text-xs flex items-center opacity-70">
                    <PaperclipIcon className="h-3 w-3 mr-1" />
                    <span>{message.file.name}</span>
                  </div>
                )}
              </div>
            </div>

            {message.isUser && (
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={user?.avatar || user?.profileImage || "/placeholder.svg?height=32&width=32"} />
                <AvatarFallback className="bg-blue-500 text-white text-xs">
                  {getUserDisplayName().charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {isGenerating && messages[messages.length - 1]?.isUser && (
          <div className="flex gap-3 justify-start">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-purple-500 text-white text-xs">AI</AvatarFallback>
            </Avatar>
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4 bg-card">
        <div className="relative max-w-4xl mx-auto">
          <Input
            className="border border-border pl-4 pr-20 py-3 text-base rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background shadow-sm text-foreground"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
          />

          {/* File Attachment Button */}
          <Button
            onClick={handleFileAttach}
            size="sm"
            variant="ghost"
            className="absolute right-12 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted rounded-full"
            disabled={isGenerating}
          >
            <PaperclipIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Button>

          {/* Send Button */}
          <Button
            onClick={handleGenerate}
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-primary hover:bg-primary/90 rounded-full"
            disabled={isGenerating || (!inputValue.trim() && !selectedFile)}
          >
            {isGenerating ? (
              <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <SendIcon className="h-4 w-4 text-primary-foreground" />
            )}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,text/*,.pdf,.doc,.docx"
          />
        </div>

        {selectedFile && (
          <div className="max-w-4xl mx-auto mt-3 text-sm text-muted-foreground flex items-center">
            <PaperclipIcon className="h-3 w-3 mr-1" />
            <span>{selectedFile.name}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-5 w-5 p-0 hover:bg-muted rounded-full"
              onClick={() => setSelectedFile(null)}
            >
              ×
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

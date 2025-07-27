"use client"

import { MarkdownRenderer } from "./markdown-renderer"

interface StreamingMarkdownProps {
  content: string
  isStreaming?: boolean
  className?: string
}

export function StreamingMarkdown({ content, isStreaming = false, className = "" }: StreamingMarkdownProps) {
  return (
    <div className={`relative ${className}`}>
      <MarkdownRenderer content={content} />
      {isStreaming && <span className="inline-block w-2 h-4 bg-foreground ml-1 animate-pulse rounded-sm" />}
    </div>
  )
}

export default StreamingMarkdown
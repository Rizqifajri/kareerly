"use client"
// @ts-nocheck - ReactMarkdown component types are complex, using any for simplicity

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Button } from "@/components/ui/button"
import { CopyIcon, CheckIcon } from "lucide-react"
import { MarkdownComponentProps } from "@/types/markdown"

interface MarkdownRendererProps {
  content: string
  className?: string
}

// Custom code block component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CodeBlock = ({ inline, className, children, ...props }: any) => {
  const [copied, setCopied] = useState(false)
  const match = /language-(\w+)/.exec(className || "")

  const handleCopy = async () => {
    await navigator.clipboard.writeText(String(children).replace(/\n$/, ""))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!inline && match) {
    return (
      <div className="relative group my-4">
        <div className="flex items-center justify-between bg-muted px-4 py-2 rounded-t-lg border-b border-border">
          <span className="text-xs font-medium text-muted-foreground">{match[1]}</span>
          <Button onClick={handleCopy} size="sm" variant="ghost" className="h-6 w-6 p-0 opacity-70 hover:opacity-100">
            {copied ? <CheckIcon className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
          </Button>
        </div>
        <pre className="bg-muted/50 p-4 rounded-b-lg overflow-x-auto border border-border border-t-0">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      </div>
    )
  }

  return (
    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono border" {...props}>
      {children}
    </code>
  )
}

// Custom markdown components
const markdownComponents = {
  code: CodeBlock,
  pre: ({ children }: MarkdownComponentProps) => children,
  h1: ({ children }: MarkdownComponentProps) => (
    <h1 className="text-xl font-bold mt-6 mb-3 text-foreground border-b border-border pb-2">{children}</h1>
  ),
  h2: ({ children }: MarkdownComponentProps) => <h2 className="text-lg font-bold mt-5 mb-3 text-foreground">{children}</h2>,
  h3: ({ children }: MarkdownComponentProps) => <h3 className="text-base font-bold mt-4 mb-2 text-foreground">{children}</h3>,
  h4: ({ children }: MarkdownComponentProps) => <h4 className="text-sm font-bold mt-3 mb-2 text-foreground">{children}</h4>,
  h5: ({ children }: MarkdownComponentProps) => <h5 className="text-sm font-semibold mt-3 mb-2 text-foreground">{children}</h5>,
  h6: ({ children }: MarkdownComponentProps) => <h6 className="text-sm font-semibold mt-3 mb-2 text-muted-foreground">{children}</h6>,
  p: ({ children }: MarkdownComponentProps) => <p className="mb-3 leading-relaxed text-foreground">{children}</p>,
  ul: ({ children }: MarkdownComponentProps) => <ul className="list-disc list-inside mb-3 space-y-1 text-foreground ml-4">{children}</ul>,
  ol: ({ children }: MarkdownComponentProps) => (
    <ol className="list-decimal list-inside mb-3 space-y-1 text-foreground ml-4">{children}</ol>
  ),
  li: ({ children }: MarkdownComponentProps) => <li className="text-foreground">{children}</li>,
  blockquote: ({ children }: MarkdownComponentProps) => (
    <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground bg-muted/30 py-2 rounded-r">
      {children}
    </blockquote>
  ),
  a: ({ href, children }: MarkdownComponentProps) => (
    <a href={href} className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  table: ({ children }: MarkdownComponentProps) => (
    <div className="overflow-x-auto my-4 border border-border rounded-lg">
      <table className="min-w-full">{children}</table>
    </div>
  ),
  thead: ({ children }: MarkdownComponentProps) => <thead className="bg-muted">{children}</thead>,
  tbody: ({ children }: MarkdownComponentProps) => <tbody>{children}</tbody>,
  tr: ({ children }: MarkdownComponentProps) => <tr className="border-b border-border last:border-b-0">{children}</tr>,
  th: ({ children }: MarkdownComponentProps) => (
    <th className="px-4 py-2 text-left font-semibold text-foreground border-r border-border last:border-r-0">
      {children}
    </th>
  ),
  td: ({ children }: MarkdownComponentProps) => (
    <td className="px-4 py-2 text-foreground border-r border-border last:border-r-0">{children}</td>
  ),
  strong: ({ children }: MarkdownComponentProps) => <strong className="font-bold text-foreground">{children}</strong>,
  em: ({ children }: MarkdownComponentProps) => <em className="italic text-foreground">{children}</em>,
  del: ({ children }: MarkdownComponentProps) => <del className="line-through text-muted-foreground">{children}</del>,
  hr: () => <hr className="my-6 border-border" />,
  img: ({ src, alt }: MarkdownComponentProps) => (
    <img src={src || "/placeholder.svg"} alt={alt} className="max-w-full h-auto rounded-lg border border-border my-4" />
  ),
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        components={markdownComponents as any}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownRenderer

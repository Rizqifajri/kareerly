import type React from "react"
export interface MarkdownComponentProps {
  children?: React.ReactNode
  className?: string
  href?: string
  src?: string
  alt?: string
  node?: unknown
  inline?: boolean
}

export interface CodeBlockProps extends MarkdownComponentProps {
  language?: string
  value?: string
}

export interface MarkdownRendererConfig {
  enableCodeCopy?: boolean
  enableSyntaxHighlighting?: boolean
  maxImageWidth?: string
  tableClassName?: string
}

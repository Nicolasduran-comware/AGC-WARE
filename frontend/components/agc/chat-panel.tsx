"use client"

import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bot,
  User,
  Paperclip,
  Send,
  Sparkles,
} from "lucide-react"
import type { ChatMessage } from "@/lib/types"
import {
  ValidationCard,
  ClassificationCard,
  RecommendationCard,
  ERPResultCard,
  FileUploadCard,
  StatusUpdateCard,
  ActionButtonsCard,
  BotTypingIndicator,
} from "@/components/agc/chat-cards"

interface ChatPanelProps {
  messages: ChatMessage[]
  isProcessing: boolean
  processingText?: string
  onSendMessage: (message: string) => void
  onAction: (action: string) => void
  onFileUpload: () => void
}

export function ChatPanel({
  messages,
  isProcessing,
  processingText,
  onSendMessage,
  onAction,
  onFileUpload,
}: ChatPanelProps) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages, isProcessing])

  const handleSend = () => {
    if (!input.trim() || isProcessing) return
    onSendMessage(input.trim())
    setInput("")
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px"
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 h-14 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">AGC-WARE Copilot</span>
          <span className="text-[10px] text-muted-foreground">Motor IA de procesamiento de facturas</span>
        </div>
        <Badge variant="outline" className="ml-auto text-[10px] text-success border-success/30 bg-success/5">
          <div className="h-1.5 w-1.5 rounded-full bg-success mr-1" />
          En línea
        </Badge>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto scroll-smooth">
        <div className="flex flex-col gap-4 p-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                message.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-0.5",
                  message.sender === "bot"
                    ? "bg-primary/10"
                    : "bg-muted"
                )}
              >
                {message.sender === "bot" ? (
                  <Bot className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>

              {/* Message Content */}
              <div
                className={cn(
                  "flex flex-col gap-1",
                  message.sender === "user" ? "items-end" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "rounded-xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                    message.sender === "bot"
                      ? "bg-card border border-border text-card-foreground rounded-tl-sm"
                      : "bg-primary text-primary-foreground rounded-tr-sm"
                  )}
                >
                  {message.content}

                  {/* Embedded Cards */}
                  {message.type === "file_upload" && message.data?.fileName && (
                    <FileUploadCard fileName={message.data.fileName} />
                  )}
                  {message.type === "validation_result" && message.data?.validation && (
                    <ValidationCard validation={message.data.validation} />
                  )}
                  {message.type === "classification_result" && message.data?.classification && (
                    <ClassificationCard classification={message.data.classification} />
                  )}
                  {message.type === "ai_recommendation" && message.data?.recommendation && (
                    <RecommendationCard
                      recommendation={message.data.recommendation}
                      onAction={onAction}
                    />
                  )}
                  {message.type === "erp_result" && message.data?.erp && (
                    <ERPResultCard erp={message.data.erp} />
                  )}
                  {message.type === "status_update" && message.data?.status && (
                    <StatusUpdateCard status={message.data.status} />
                  )}
                  {message.type === "action_buttons" && message.data?.actions && (
                    <ActionButtonsCard actions={message.data.actions} onAction={onAction} />
                  )}
                  {message.type === "error" && (
                    <div className="mt-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
                      Error en el procesamiento. Intente nuevamente.
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground px-1">
                  {message.timestamp}
                </span>
              </div>
            </div>
          ))}

          {/* Bot Typing Indicator */}
          {isProcessing && (
            <div className="flex gap-3 mr-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="rounded-xl bg-card border border-border px-4 py-3 rounded-tl-sm">
                <BotTypingIndicator text={processingText} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <div className="flex items-end gap-2 rounded-xl border border-border bg-card p-2 focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-primary/50 transition-all">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={onFileUpload}
            aria-label="Adjuntar archivo XML"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje o adjunta un archivo XML..."
            className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[32px] max-h-[120px] py-1.5"
            rows={1}
            disabled={isProcessing}
          />
          <Button
            size="sm"
            className="h-8 w-8 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            aria-label="Enviar mensaje"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          AGC-WARE puede cometer errores. Verifica la información importante.
        </p>
      </div>
    </div>
  )
}

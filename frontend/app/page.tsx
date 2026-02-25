"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { AppSidebar } from "@/components/agc/app-sidebar"
import { ChatPanel } from "@/components/agc/chat-panel"
import { ContextPanel } from "@/components/agc/context-panel"
import type {
  ChatMessage,
  InvoiceData,
  ValidationResult,
  ClassificationResult,
  AIRecommendation,
  AuditEntry,
  InvoiceStatus,
} from "@/lib/types"
import {
  getDemoMessages,
  getDemoAuditLog,
  demoInvoice,
  demoValidation,
  demoClassification,
  demoRecommendation,
} from "@/lib/demo-data"

// ---- Conversation storage ----
interface ConversationRecord {
  id: string
  title: string
  date: string
  messages: ChatMessage[]
}

function getTimestamp() {
  return new Date().toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDate() {
  const now = new Date()
  const h = now.getHours().toString().padStart(2, "0")
  const m = now.getMinutes().toString().padStart(2, "0")
  return `Hoy, ${h}:${m}`
}

const DEMO_CONVERSATION_ID = "demo-conv"

export default function AGCWarePage() {
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState("chat")

  // Context panel state
  const [contextCollapsed, setContextCollapsed] = useState(false)

  // Conversations
  const [conversations, setConversations] = useState<ConversationRecord[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingText, setProcessingText] = useState<string | undefined>()

  // Invoice context state
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceData | null>(null)
  const [currentValidation, setCurrentValidation] = useState<ValidationResult | null>(null)
  const [currentClassification, setCurrentClassification] = useState<ClassificationResult | null>(null)
  const [currentRecommendation, setCurrentRecommendation] = useState<AIRecommendation | null>(null)
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([])

  // Demo flow state
  const [demoStep, setDemoStep] = useState(0)
  const [demoStarted, setDemoStarted] = useState(false)

  // Track if current session is demo
  const isDemoRef = useRef(false)

  const { messages: demoMessages, delays } = getDemoMessages()

  // ---- Persist messages back to conversations ----
  useEffect(() => {
    if (!activeConversationId || isDemoRef.current) return
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId ? { ...c, messages } : c
      )
    )
  }, [messages, activeConversationId])

  // ---- Generate title from first user message ----
  const updateConversationTitle = useCallback(
    (convId: string, firstUserMsg: string) => {
      const title =
        firstUserMsg.length > 40
          ? firstUserMsg.slice(0, 40) + "..."
          : firstUserMsg
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, title } : c))
      )
    },
    []
  )

  // Status progression for invoice demo
  const statusProgression: (InvoiceStatus | null)[] = [
    null, null, null, "recibida", "validando", "validada",
    "clasificada", "aprobada", null, "enviando_erp", "enviada_erp", "enviada_erp",
  ]

  const advanceDemo = useCallback(() => {
    if (demoStep >= demoMessages.length) return

    const nextMessage = demoMessages[demoStep]
    const nextStatus = statusProgression[demoStep]

    if (nextMessage.sender === "bot" && demoStep > 0) {
      setIsProcessing(true)
      const loadingTexts: Record<number, string> = {
        2: "Analizando solicitud...",
        4: "Procesando factura...",
        5: "Validando factura con SAT...",
        6: "Clasificando contablemente...",
        7: "Generando recomendacion IA...",
        9: "Enviando al ERP...",
        10: "Confirmando registro...",
        11: "Generando resumen...",
      }
      setProcessingText(loadingTexts[demoStep] || "Procesando...")

      const typingDelay = delays[demoStep] || 1000

      setTimeout(() => {
        setIsProcessing(false)
        setProcessingText(undefined)
        setMessages((prev) => [...prev, nextMessage])

        if (nextStatus) {
          setCurrentInvoice((prev) => {
            if (!prev && demoStep >= 3) return { ...demoInvoice, status: nextStatus }
            return prev ? { ...prev, status: nextStatus } : null
          })
        }

        if (demoStep === 5) setCurrentValidation(demoValidation)
        if (demoStep === 6) setCurrentClassification(demoClassification)
        if (demoStep === 7) setCurrentRecommendation(demoRecommendation)

        setAuditLog(getDemoAuditLog(demoStep))
        setDemoStep((prev) => prev + 1)
      }, typingDelay)
    } else {
      setMessages((prev) => [...prev, nextMessage])
      if (nextStatus) {
        setCurrentInvoice((prev) => {
          if (!prev && demoStep >= 3) return { ...demoInvoice, status: nextStatus }
          return prev ? { ...prev, status: nextStatus } : null
        })
      }
      setAuditLog(getDemoAuditLog(demoStep))
      setDemoStep((prev) => prev + 1)
    }
  }, [demoStep, demoMessages, delays, statusProgression])

  // Auto-advance demo
  useEffect(() => {
    if (!demoStarted) return
    if (demoStep >= demoMessages.length) return
    if (isProcessing) return

    const timer = setTimeout(() => {
      advanceDemo()
    }, demoStep === 0 ? 500 : 1200)

    return () => clearTimeout(timer)
  }, [demoStep, demoStarted, isProcessing, advanceDemo, demoMessages.length])

  // ---- n8n send message ----
  const sendToN8N = async (userContent: string): Promise<string> => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userContent,
          conversationId: activeConversationId,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Error del servidor")
      }
      const data = await res.json()
      return data.reply || "Sin respuesta del servicio."
    } catch (error) {
      console.error("[v0] Error sending to n8n:", error)
      throw error
    }
  }

  // ---- Format assistant text from n8n ----
  function formatAssistantText(text: string): string {
    if (!text) return text

    let formatted = text

    // Saltos de línea antes de enumeraciones tipo "1)" "2)" etc.
    formatted = formatted.replace(/\s+(\d+\))/g, "\n$1")

    // Saltos de línea después de puntos, excepto el último punto del texto
    const trimmed = formatted.trimEnd()
    const lastDotIndex = trimmed.lastIndexOf(".")

    if (lastDotIndex > -1) {
      const beforeLastDot = trimmed.slice(0, lastDotIndex)
      const fromLastDot = trimmed.slice(lastDotIndex)
      // Reemplaza ". " por ".\n" sólo en la parte anterior al último punto
      const beforeWithBreaks = beforeLastDot.replace(/\. /g, ".\n")
      formatted = beforeWithBreaks + fromLastDot
    }

    return formatted
  }

  // ---- Handlers ----
  const handleSendMessage = async (content: string) => {
    // If this is the first message and no active conversation, create one
    let convId = activeConversationId
    if (!convId) {
      convId = `conv-${Date.now()}`
      const newConv: ConversationRecord = {
        id: convId,
        title: "Nueva conversacion",
        date: formatDate(),
        messages: [],
      }
      setConversations((prev) => [newConv, ...prev])
      setActiveConversationId(convId)
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      type: "text",
      content,
      timestamp: getTimestamp(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Update title from first user message
    const currentConv = conversations.find((c) => c.id === convId)
    if (!currentConv || currentConv.messages.length === 0) {
      updateConversationTitle(convId, content)
    }

    // Send to n8n
    setIsProcessing(true)
    setProcessingText("Procesando...")

    try {
      const reply = await sendToN8N(content)
      const formattedReply = formatAssistantText(reply)
      setIsProcessing(false)
      setProcessingText(undefined)

      const botResponse: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        type: "text",
        content: formattedReply,
        timestamp: getTimestamp(),
      }
      setMessages((prev) => [...prev, botResponse])
    } catch {
      setIsProcessing(false)
      setProcessingText(undefined)

      const errorResponse: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: "bot",
        type: "error",
        content: "No se pudo conectar con el servicio de IA. Intenta de nuevo.",
        timestamp: getTimestamp(),
      }
      setMessages((prev) => [...prev, errorResponse])
    }
  }

  const handleAction = (action: string) => {
    if (action === "aprobar" && demoStep < demoMessages.length) return
    const actionMessage: ChatMessage = {
      id: `action-${Date.now()}`,
      sender: "user",
      type: "text",
      content: `Accion seleccionada: ${action}`,
      timestamp: getTimestamp(),
    }
    setMessages((prev) => [...prev, actionMessage])
  }

  const handleFileUpload = () => {
    const uploadMessage: ChatMessage = {
      id: `upload-${Date.now()}`,
      sender: "user",
      type: "file_upload",
      content: "Archivo adjuntado.",
      timestamp: getTimestamp(),
      data: { fileName: "factura_ejemplo.xml" },
    }
    setMessages((prev) => [...prev, uploadMessage])
  }

  const resetState = () => {
    setMessages([])
    setCurrentInvoice(null)
    setCurrentValidation(null)
    setCurrentClassification(null)
    setCurrentRecommendation(null)
    setAuditLog([])
    setDemoStep(0)
    setDemoStarted(false)
    setIsProcessing(false)
    setProcessingText(undefined)
    isDemoRef.current = false
  }

  const handleNewConversation = () => {
    resetState()
    const convId = `conv-${Date.now()}`
    const newConv: ConversationRecord = {
      id: convId,
      title: "Nueva conversacion",
      date: formatDate(),
      messages: [],
    }
    setConversations((prev) => [newConv, ...prev])
    setActiveConversationId(convId)
  }

  const handleDemoConversation = () => {
    resetState()
    isDemoRef.current = true

    // Crear la conversacion de ejemplo solo la primera vez
    setConversations((prev) => {
      const exists = prev.some((c) => c.id === DEMO_CONVERSATION_ID)
      if (exists) return prev

      const demoConv: ConversationRecord = {
        id: DEMO_CONVERSATION_ID,
        title: "Ejemplo de conversacion",
        date: formatDate(),
        messages: demoMessages,
      }

      return [demoConv, ...prev]
    })

    setActiveConversationId(DEMO_CONVERSATION_ID)

    setTimeout(() => {
      setDemoStarted(true)
    }, 300)
  }

  const handleSelectConversation = (id: string) => {
    // Save current messages if needed
    resetState()
    isDemoRef.current = false
    setActiveConversationId(id)
    const conv = conversations.find((c) => c.id === id)
    if (conv) {
      setMessages(conv.messages)
    }
  }

  // Map conversations to sidebar format
  const sidebarConversations = conversations.map((c) => ({
    id: c.id,
    title: c.title,
    date: c.date,
    active: c.id === activeConversationId,
  }))

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left Sidebar */}
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        conversations={sidebarConversations}
        activeConversation={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDemoConversation={handleDemoConversation}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Central Chat */}
      <main className="flex-1 min-w-0">
        <ChatPanel
          messages={messages}
          isProcessing={isProcessing}
          processingText={processingText}
          onSendMessage={handleSendMessage}
          onAction={handleAction}
          onFileUpload={handleFileUpload}
        />
      </main>

      {/* Right Context Panel */}
      <ContextPanel
        invoice={currentInvoice}
        validation={currentValidation}
        classification={currentClassification}
        recommendation={currentRecommendation}
        auditLog={auditLog}
        collapsed={contextCollapsed}
        onToggle={() => setContextCollapsed(!contextCollapsed)}
      />
    </div>
  )
}

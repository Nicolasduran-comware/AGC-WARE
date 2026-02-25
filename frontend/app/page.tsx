"use client"

import { useState, useEffect, useCallback } from "react"
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
  demoConversations,
} from "@/lib/demo-data"

export default function AGCWarePage() {
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState("chat")
  const [activeConversation, setActiveConversation] = useState<string | null>("conv-1")

  // Context panel state
  const [contextCollapsed, setContextCollapsed] = useState(false)

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

  const { messages: demoMessages, delays } = getDemoMessages()

  // Status progression for invoice
  const statusProgression: (InvoiceStatus | null)[] = [
    null,        // msg-1: welcome
    null,        // msg-2: user asks
    null,        // msg-3: bot asks for file
    "recibida",  // msg-4: file uploaded
    "validando", // msg-5: status update
    "validada",  // msg-6: validation result
    "clasificada", // msg-7: classification
    "aprobada",  // msg-8: recommendation
    null,        // msg-9: user approves
    "enviando_erp", // msg-10: sending
    "enviada_erp", // msg-11: erp result
    "enviada_erp", // msg-12: complete
  ]

  const advanceDemo = useCallback(() => {
    if (demoStep >= demoMessages.length) return

    const nextMessage = demoMessages[demoStep]
    const nextStatus = statusProgression[demoStep]

    // Show processing indicator before bot messages
    if (nextMessage.sender === "bot" && demoStep > 0) {
      setIsProcessing(true)
      const loadingTexts: Record<number, string> = {
        2: "Analizando solicitud...",
        4: "Procesando factura...",
        5: "Validando factura con SAT...",
        6: "Clasificando contablemente...",
        7: "Generando recomendación IA...",
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

        // Update invoice context
        if (nextStatus) {
          setCurrentInvoice((prev) => {
            if (!prev && demoStep >= 3) {
              return { ...demoInvoice, status: nextStatus }
            }
            return prev ? { ...prev, status: nextStatus } : null
          })
        }

        // Update validation/classification/recommendation
        if (demoStep === 5) setCurrentValidation(demoValidation)
        if (demoStep === 6) setCurrentClassification(demoClassification)
        if (demoStep === 7) setCurrentRecommendation(demoRecommendation)

        // Update audit log
        setAuditLog(getDemoAuditLog(demoStep))

        setDemoStep((prev) => prev + 1)
      }, typingDelay)
    } else {
      // User messages appear immediately
      setMessages((prev) => [...prev, nextMessage])

      if (nextStatus) {
        setCurrentInvoice((prev) => {
          if (!prev && demoStep >= 3) {
            return { ...demoInvoice, status: nextStatus }
          }
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

  // Start demo on mount
  useEffect(() => {
    setDemoStarted(true)
  }, [])

  const handleSendMessage = (content: string) => {
    const newMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      type: "text",
      content,
      timestamp: new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }
    setMessages((prev) => [...prev, newMessage])

    // Simulate bot response
    setIsProcessing(true)
    setProcessingText("Analizando consulta...")
    setTimeout(() => {
      setIsProcessing(false)
      setProcessingText(undefined)
      const botResponse: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        type: "text",
        content:
          "Entendido. Estoy procesando tu solicitud. Puedes adjuntar un archivo XML para iniciar un nuevo flujo de procesamiento, o preguntarme sobre el estado de cualquier factura.",
        timestamp: new Date().toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }
      setMessages((prev) => [...prev, botResponse])
    }, 1500)
  }

  const handleAction = (action: string) => {
    if (action === "aprobar" && demoStep < demoMessages.length) {
      // Continue demo flow after approval
      return
    }
    const actionMessage: ChatMessage = {
      id: `action-${Date.now()}`,
      sender: "user",
      type: "text",
      content: `Acción seleccionada: ${action}`,
      timestamp: new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }
    setMessages((prev) => [...prev, actionMessage])
  }

  const handleFileUpload = () => {
    const uploadMessage: ChatMessage = {
      id: `upload-${Date.now()}`,
      sender: "user",
      type: "file_upload",
      content: "Archivo adjuntado.",
      timestamp: new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      data: { fileName: "factura_ejemplo.xml" },
    }
    setMessages((prev) => [...prev, uploadMessage])
  }

  const handleNewConversation = () => {
    setMessages([])
    setCurrentInvoice(null)
    setCurrentValidation(null)
    setCurrentClassification(null)
    setCurrentRecommendation(null)
    setAuditLog([])
    setDemoStep(0)
    setDemoStarted(false)
    setActiveConversation(null)

    // Restart demo after a brief pause
    setTimeout(() => {
      setDemoStarted(true)
    }, 500)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left Sidebar */}
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        conversations={demoConversations}
        activeConversation={activeConversation}
        onSelectConversation={setActiveConversation}
        onNewConversation={handleNewConversation}
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

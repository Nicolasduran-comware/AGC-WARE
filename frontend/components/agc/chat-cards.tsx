"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Brain,
  Send,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Loader2,
} from "lucide-react"
import type {
  ValidationResult,
  ClassificationResult,
  AIRecommendation,
  ERPResult,
  InvoiceStatus,
} from "@/lib/types"
import { cn } from "@/lib/utils"

// Validation Result Card
export function ValidationCard({
  validation,
}: {
  validation: ValidationResult
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 mt-2">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-card-foreground">
          Resultado de Validación
        </span>
        <Badge
          variant={validation.isValid ? "default" : "destructive"}
          className={cn(
            "ml-auto text-[10px]",
            validation.isValid && "bg-success text-success-foreground"
          )}
        >
          {validation.isValid ? "Válida" : "Con Errores"}
        </Badge>
      </div>
      <div className="flex flex-col gap-2">
        {validation.checks.map((check, i) => (
          <div
            key={i}
            className="flex items-start gap-2 text-xs"
          >
            {check.passed ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
            )}
            <div className="flex flex-col">
              <span className="font-medium text-card-foreground">{check.name}</span>
              <span className="text-muted-foreground">{check.detail}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Puntuación</span>
          <span className="font-semibold text-card-foreground">{validation.score}%</span>
        </div>
        <Progress value={validation.score} className="h-1.5" />
      </div>
    </div>
  )
}

// Classification Result Card
export function ClassificationCard({
  classification,
}: {
  classification: ClassificationResult
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 mt-2">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-card-foreground">
          Clasificación Contable
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Cuenta Contable
          </span>
          <span className="text-sm font-medium text-card-foreground font-mono">
            {classification.cuentaContable}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Centro de Costo
          </span>
          <span className="text-sm font-medium text-card-foreground font-mono">
            {classification.centroCosto}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 col-span-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Descripción
          </span>
          <span className="text-sm text-card-foreground">
            {classification.descripcionCuenta}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Categoría
          </span>
          <Badge variant="secondary" className="w-fit text-[10px]">
            {classification.categoria}
          </Badge>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Confianza IA
          </span>
          <div className="flex items-center gap-2">
            <Progress value={classification.confianza} className="h-1.5 flex-1" />
            <span className="text-xs font-medium text-card-foreground">
              {classification.confianza}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// AI Recommendation Card
export function RecommendationCard({
  recommendation,
  onAction,
}: {
  recommendation: AIRecommendation
  onAction?: (action: string) => void
}) {
  const actionConfig = {
    aprobar: { color: "bg-success", label: "Aprobar", textColor: "text-success" },
    revisar: { color: "bg-warning", label: "Revisar", textColor: "text-warning-foreground" },
    rechazar: { color: "bg-destructive", label: "Rechazar", textColor: "text-destructive" },
  }
  const config = actionConfig[recommendation.action]

  return (
    <div className="rounded-lg border border-border bg-card p-4 mt-2">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-card-foreground">
          Recomendación IA
        </span>
        <Badge
          className={cn(
            "ml-auto text-[10px] border-0",
            config.color,
            recommendation.action === "aprobar" ? "text-success-foreground" : recommendation.action === "rechazar" ? "text-primary-foreground" : ""
          )}
        >
          {config.label}
        </Badge>
      </div>
      <p className="text-sm text-card-foreground leading-relaxed mb-3">
        {recommendation.reasoning}
      </p>
      {recommendation.flags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {recommendation.flags.map((flag, i) => (
            <div
              key={i}
              className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[10px] text-muted-foreground"
            >
              <AlertTriangle className="h-3 w-3" />
              {flag}
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-auto">
          <span>Confianza:</span>
          <span className="font-semibold text-card-foreground">{recommendation.confidence}%</span>
        </div>
        {onAction && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => onAction("corregir")}
            >
              Corregir
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs bg-success text-success-foreground hover:bg-success/90"
              onClick={() => onAction("aprobar")}
            >
              Aprobar
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

// ERP Result Card
export function ERPResultCard({ erp }: { erp: ERPResult }) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 mt-2",
        erp.success
          ? "border-success/30 bg-success/5"
          : "border-destructive/30 bg-destructive/5"
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <Send className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-card-foreground">
          Resultado ERP
        </span>
        <Badge
          className={cn(
            "ml-auto text-[10px] border-0",
            erp.success
              ? "bg-success text-success-foreground"
              : "bg-destructive text-primary-foreground"
          )}
        >
          {erp.success ? "Enviada" : "Error"}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground">ID ERP</span>
          <span className="font-mono font-medium text-card-foreground">{erp.erpId}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground">Módulo</span>
          <span className="font-medium text-card-foreground">{erp.module}</span>
        </div>
        <div className="flex flex-col gap-0.5 col-span-2">
          <span className="text-muted-foreground">Mensaje</span>
          <span className="text-card-foreground">{erp.message}</span>
        </div>
        <div className="flex flex-col gap-0.5 col-span-2">
          <span className="text-muted-foreground">Timestamp</span>
          <span className="font-mono text-card-foreground">{erp.timestamp}</span>
        </div>
      </div>
    </div>
  )
}

// File Upload Card
export function FileUploadCard({ fileName }: { fileName: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 mt-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
        <FileText className="h-4 w-4 text-primary" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-card-foreground">{fileName}</span>
        <span className="text-[10px] text-muted-foreground">Archivo XML cargado</span>
      </div>
      <CheckCircle2 className="h-4 w-4 text-success ml-auto" />
    </div>
  )
}

// Status Update Card
export function StatusUpdateCard({ status }: { status: InvoiceStatus }) {
  const statusConfig: Record<InvoiceStatus, { label: string; color: string; bgColor: string }> = {
    recibida: { label: "Factura Recibida", color: "text-info", bgColor: "bg-info/10" },
    validando: { label: "Validando...", color: "text-warning-foreground", bgColor: "bg-warning/10" },
    validada: { label: "Validación Completa", color: "text-success", bgColor: "bg-success/10" },
    clasificando: { label: "Clasificando...", color: "text-warning-foreground", bgColor: "bg-warning/10" },
    clasificada: { label: "Clasificación Completa", color: "text-success", bgColor: "bg-success/10" },
    recomendando: { label: "Generando Recomendación IA...", color: "text-info", bgColor: "bg-info/10" },
    aprobada: { label: "Aprobada", color: "text-success", bgColor: "bg-success/10" },
    enviando_erp: { label: "Enviando a ERP...", color: "text-warning-foreground", bgColor: "bg-warning/10" },
    enviada_erp: { label: "Enviada a ERP", color: "text-success", bgColor: "bg-success/10" },
    error: { label: "Error", color: "text-destructive", bgColor: "bg-destructive/10" },
  }

  const config = statusConfig[status]
  const isLoading = ["validando", "clasificando", "recomendando", "enviando_erp"].includes(status)

  return (
    <div className={cn("flex items-center gap-2 rounded-md px-3 py-2 mt-1 text-xs font-medium", config.bgColor, config.color)}>
      {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
      {!isLoading && <div className="h-1.5 w-1.5 rounded-full bg-current" />}
      {config.label}
    </div>
  )
}

// Action Buttons Card
export function ActionButtonsCard({
  actions,
  onAction,
}: {
  actions: { label: string; variant: "default" | "outline" | "destructive"; action: string }[]
  onAction?: (action: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      {actions.map((action, i) => (
        <Button
          key={i}
          size="sm"
          variant={action.variant}
          className={cn(
            "h-8 text-xs",
            action.variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          onClick={() => onAction?.(action.action)}
        >
          {action.label}
        </Button>
      ))}
    </div>
  )
}

// Loading Indicator for Bot
export function BotTypingIndicator({ text }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      <span>{text || "Procesando..."}</span>
    </div>
  )
}

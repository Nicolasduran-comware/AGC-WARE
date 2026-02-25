"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Brain,
  Send,
  Shield,
  TrendingUp,
  ChevronRight,
  Info,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react"
import type {
  InvoiceData,
  InvoiceStatus,
  ValidationResult,
  ClassificationResult,
  AIRecommendation,
  AuditEntry,
} from "@/lib/types"

interface ContextPanelProps {
  invoice: InvoiceData | null
  validation: ValidationResult | null
  classification: ClassificationResult | null
  recommendation: AIRecommendation | null
  auditLog: AuditEntry[]
  collapsed: boolean
  onToggle: () => void
}

const statusConfig: Record<InvoiceStatus, { label: string; color: string; bgColor: string }> = {
  recibida: { label: "Recibida", color: "text-info", bgColor: "bg-info/10" },
  validando: { label: "Validando", color: "text-warning-foreground", bgColor: "bg-warning/10" },
  validada: { label: "Validada", color: "text-success", bgColor: "bg-success/10" },
  clasificando: { label: "Clasificando", color: "text-warning-foreground", bgColor: "bg-warning/10" },
  clasificada: { label: "Clasificada", color: "text-success", bgColor: "bg-success/10" },
  recomendando: { label: "IA Procesando", color: "text-info", bgColor: "bg-info/10" },
  aprobada: { label: "Aprobada", color: "text-success", bgColor: "bg-success/10" },
  enviando_erp: { label: "Enviando ERP", color: "text-warning-foreground", bgColor: "bg-warning/10" },
  enviada_erp: { label: "En ERP", color: "text-success", bgColor: "bg-success/10" },
  error: { label: "Error", color: "text-destructive", bgColor: "bg-destructive/10" },
}

const auditIconMap: Record<string, typeof CheckCircle2> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
}

export function ContextPanel({
  invoice,
  validation,
  classification,
  recommendation,
  auditLog,
  collapsed,
  onToggle,
}: ContextPanelProps) {
  if (collapsed) {
    return (
      <div className="flex flex-col items-center border-l border-border bg-card w-12 h-full">
        <button
          onClick={onToggle}
          className="flex items-center justify-center p-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Expandir panel de contexto"
        >
          <PanelRightOpen className="h-4 w-4" />
        </button>
        {invoice && (
          <div className="flex flex-col items-center gap-3 mt-4">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" title="Factura activa" />
            {validation && <Shield className="h-3.5 w-3.5 text-muted-foreground" />}
            {classification && <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />}
            {recommendation && <Brain className="h-3.5 w-3.5 text-muted-foreground" />}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col border-l border-border bg-card w-80 h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 h-14 shrink-0 border-b border-border">
        <span className="text-sm font-semibold text-foreground">Contexto</span>
        <button
          onClick={onToggle}
          className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Cerrar panel de contexto"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scroll-smooth">
        <div className="p-4 flex flex-col gap-4">
          {!invoice ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">Sin factura activa</span>
              <span className="text-xs text-muted-foreground mt-1">
                Carga una factura XML para ver el contexto
              </span>
            </div>
          ) : (
            <>
              {/* Invoice Info */}
              <div className="rounded-lg border border-border bg-background p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">Factura Activa</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] border-0",
                      statusConfig[invoice.status].bgColor,
                      statusConfig[invoice.status].color
                    )}
                  >
                    {statusConfig[invoice.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <InfoRow label="Folio" value={invoice.folio} />
                  <InfoRow label="Tipo" value={invoice.tipoComprobante} />
                  <InfoRow label="Emisor" value={invoice.emisor} className="col-span-2" />
                  <InfoRow label="RFC Emisor" value={invoice.rfcEmisor} mono />
                  <InfoRow label="Fecha" value={invoice.fecha} />
                  <InfoRow
                    label="Total"
                    value={`$${invoice.total.toLocaleString("es-MX", { minimumFractionDigits: 2 })} ${invoice.moneda}`}
                    highlight
                  />
                  <InfoRow label="UUID" value={invoice.uuid.substring(0, 18) + "..."} mono className="col-span-2" />
                </div>
              </div>

              {/* Validation Result */}
              {validation && (
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">Validación</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "ml-auto text-[9px] border-0",
                        validation.isValid
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      )}
                    >
                      {validation.score}%
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {validation.checks.map((check, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {check.passed ? (
                          <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                        ) : (
                          <XCircle className="h-3 w-3 text-destructive shrink-0" />
                        )}
                        <span className="text-foreground">{check.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Classification */}
              {classification && (
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">Clasificación</span>
                  </div>
                  <div className="flex flex-col gap-2 text-xs">
                    <InfoRow label="Cuenta" value={classification.cuentaContable} mono />
                    <InfoRow label="Centro Costo" value={classification.centroCosto} mono />
                    <InfoRow label="Categoría" value={classification.categoria} />
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-muted-foreground">Confianza</span>
                      <Progress value={classification.confianza} className="h-1 flex-1" />
                      <span className="font-medium text-foreground">{classification.confianza}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Recommendation */}
              {recommendation && (
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">Recomendación IA</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "ml-auto text-[9px] border-0",
                        recommendation.action === "aprobar"
                          ? "bg-success/10 text-success"
                          : recommendation.action === "revisar"
                          ? "bg-warning/10 text-warning-foreground"
                          : "bg-destructive/10 text-destructive"
                      )}
                    >
                      {recommendation.action === "aprobar" ? "Aprobar" : recommendation.action === "revisar" ? "Revisar" : "Rechazar"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                    {recommendation.reasoning}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Confianza</span>
                    <Progress value={recommendation.confidence} className="h-1 flex-1" />
                    <span className="font-medium text-foreground">{recommendation.confidence}%</span>
                  </div>
                </div>
              )}

              {/* Audit Timeline */}
              {auditLog.length > 0 && (
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">Línea de Tiempo</span>
                  </div>
                  <div className="relative flex flex-col gap-0">
                    {auditLog.map((entry, i) => {
                      const Icon = auditIconMap[entry.status] || Info
                      const isLast = i === auditLog.length - 1
                      return (
                        <div key={entry.id} className="flex gap-3 relative">
                          {/* Timeline line */}
                          {!isLast && (
                            <div className="absolute left-[7px] top-5 bottom-0 w-px bg-border" />
                          )}
                          {/* Icon */}
                          <div className="shrink-0 mt-0.5 z-10">
                            <Icon
                              className={cn(
                                "h-3.5 w-3.5",
                                entry.status === "success" && "text-success",
                                entry.status === "warning" && "text-warning-foreground",
                                entry.status === "error" && "text-destructive",
                                entry.status === "info" && "text-info"
                              )}
                            />
                          </div>
                          {/* Content */}
                          <div className="flex flex-col pb-3 min-w-0">
                            <span className="text-xs font-medium text-foreground truncate">
                              {entry.action}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{entry.detail}</span>
                            <span className="text-[9px] text-muted-foreground mt-0.5">
                              {entry.timestamp} - {entry.user}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper sub-component
function InfoRow({
  label,
  value,
  mono,
  highlight,
  className,
}: {
  label: string
  value: string
  mono?: boolean
  highlight?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      <span
        className={cn(
          "text-xs text-foreground truncate",
          mono && "font-mono",
          highlight && "font-semibold text-primary"
        )}
      >
        {value}
      </span>
    </div>
  )
}

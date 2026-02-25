export type InvoiceStatus =
  | "recibida"
  | "validando"
  | "validada"
  | "clasificando"
  | "clasificada"
  | "recomendando"
  | "aprobada"
  | "enviando_erp"
  | "enviada_erp"
  | "error"

export interface InvoiceData {
  id: string
  folio: string
  emisor: string
  receptor: string
  rfcEmisor: string
  rfcReceptor: string
  fecha: string
  subtotal: number
  iva: number
  total: number
  moneda: string
  uuid: string
  status: InvoiceStatus
  tipoComprobante: string
  conceptos: {
    descripcion: string
    cantidad: number
    valorUnitario: number
    importe: number
  }[]
}

export interface ValidationResult {
  isValid: boolean
  checks: {
    name: string
    passed: boolean
    detail: string
  }[]
  score: number
}

export interface ClassificationResult {
  cuentaContable: string
  descripcionCuenta: string
  centroCosto: string
  categoria: string
  confianza: number
}

export interface AIRecommendation {
  action: "aprobar" | "revisar" | "rechazar"
  confidence: number
  reasoning: string
  flags: string[]
}

export interface ERPResult {
  success: boolean
  erpId: string
  timestamp: string
  module: string
  message: string
}

export interface AuditEntry {
  id: string
  timestamp: string
  action: string
  detail: string
  user: string
  status: "success" | "warning" | "error" | "info"
}

export type MessageType =
  | "text"
  | "file_upload"
  | "validation_result"
  | "classification_result"
  | "ai_recommendation"
  | "erp_result"
  | "status_update"
  | "error"
  | "action_buttons"

export interface ChatMessage {
  id: string
  sender: "bot" | "user"
  type: MessageType
  content: string
  timestamp: string
  data?: {
    invoice?: InvoiceData
    validation?: ValidationResult
    classification?: ClassificationResult
    recommendation?: AIRecommendation
    erp?: ERPResult
    fileName?: string
    status?: InvoiceStatus
    actions?: {
      label: string
      variant: "default" | "outline" | "destructive"
      action: string
    }[]
  }
  isLoading?: boolean
  loadingText?: string
}

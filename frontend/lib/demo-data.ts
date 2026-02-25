import type {
  ChatMessage,
  InvoiceData,
  ValidationResult,
  ClassificationResult,
  AIRecommendation,
  ERPResult,
  AuditEntry,
} from "@/lib/types"

export const demoInvoice: InvoiceData = {
  id: "inv-001",
  folio: "A-4521",
  emisor: "Tecnologías Avanzadas S.A. de C.V.",
  receptor: "AGC Corporativo S.A. de C.V.",
  rfcEmisor: "TAV200315KJ8",
  rfcReceptor: "AGC180901LP4",
  fecha: "2026-02-20",
  subtotal: 45800.0,
  iva: 7328.0,
  total: 53128.0,
  moneda: "MXN",
  uuid: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  tipoComprobante: "Ingreso",
  status: "recibida",
  conceptos: [
    {
      descripcion: "Servicio de consultoría tecnológica",
      cantidad: 1,
      valorUnitario: 35000.0,
      importe: 35000.0,
    },
    {
      descripcion: "Licencias de software empresarial",
      cantidad: 3,
      valorUnitario: 3600.0,
      importe: 10800.0,
    },
  ],
}

export const demoValidation: ValidationResult = {
  isValid: true,
  checks: [
    { name: "Estructura XML", passed: true, detail: "Formato CFDI 4.0 válido" },
    { name: "Sello Digital", passed: true, detail: "Firma del emisor verificada" },
    { name: "RFC Emisor", passed: true, detail: "RFC activo en lista del SAT" },
    { name: "RFC Receptor", passed: true, detail: "Coincide con razón social" },
    { name: "UUID SAT", passed: true, detail: "Folio fiscal verificado" },
    { name: "Cálculos Fiscales", passed: true, detail: "IVA y subtotal correctos" },
  ],
  score: 98,
}

export const demoClassification: ClassificationResult = {
  cuentaContable: "6100-001-003",
  descripcionCuenta: "Gastos de consultoría y servicios profesionales",
  centroCosto: "CC-TI-2026",
  categoria: "Servicios Profesionales",
  confianza: 94,
}

export const demoRecommendation: AIRecommendation = {
  action: "aprobar",
  confidence: 96,
  reasoning:
    "La factura cumple con todas las validaciones fiscales. El proveedor tiene historial positivo (12 transacciones previas). El monto está dentro del presupuesto autorizado para el centro de costo CC-TI-2026. Se recomienda aprobar y enviar al ERP.",
  flags: ["Monto superior a $50,000"],
}

export const demoERPResult: ERPResult = {
  success: true,
  erpId: "ERP-2026-04521",
  timestamp: "2026-02-24T14:32:15Z",
  module: "Cuentas por Pagar",
  message: "Factura registrada exitosamente en el módulo de Cuentas por Pagar.",
}

// Staged messages to simulate the flow
export function getDemoMessages(): { messages: ChatMessage[]; delays: number[] } {
  const messages: ChatMessage[] = [
    {
      id: "msg-1",
      sender: "bot",
      type: "text",
      content:
        "Bienvenido a AGC-WARE. Soy tu Copilot Contable Empresarial. Puedo ayudarte a procesar, validar y clasificar facturas electrónicas usando inteligencia artificial. Adjunta un archivo XML para comenzar, o escríbeme lo que necesitas.",
      timestamp: "14:25",
    },
    {
      id: "msg-2",
      sender: "user",
      type: "text",
      content: "Necesito procesar una factura nueva de Tecnologías Avanzadas.",
      timestamp: "14:26",
    },
    {
      id: "msg-3",
      sender: "bot",
      type: "text",
      content:
        "Perfecto, adjunta el archivo XML de la factura y comenzaré el procesamiento automático.",
      timestamp: "14:26",
    },
    {
      id: "msg-4",
      sender: "user",
      type: "file_upload",
      content: "He adjuntado la factura.",
      timestamp: "14:27",
      data: { fileName: "factura_TAV_A4521.xml" },
    },
    {
      id: "msg-5",
      sender: "bot",
      type: "status_update",
      content: "Factura recibida correctamente. Iniciando proceso de validación...",
      timestamp: "14:27",
      data: { status: "recibida" },
    },
    {
      id: "msg-6",
      sender: "bot",
      type: "validation_result",
      content: "La validación ha finalizado. Todos los controles fiscales pasaron exitosamente.",
      timestamp: "14:28",
      data: { validation: demoValidation },
    },
    {
      id: "msg-7",
      sender: "bot",
      type: "classification_result",
      content:
        "He clasificado la factura automáticamente basándome en el historial contable y los conceptos facturados.",
      timestamp: "14:28",
      data: { classification: demoClassification },
    },
    {
      id: "msg-8",
      sender: "bot",
      type: "ai_recommendation",
      content: "Basándome en el análisis completo, esta es mi recomendación:",
      timestamp: "14:29",
      data: { recommendation: demoRecommendation },
    },
    {
      id: "msg-9",
      sender: "user",
      type: "text",
      content: "Aprobado. Enviar al ERP.",
      timestamp: "14:30",
    },
    {
      id: "msg-10",
      sender: "bot",
      type: "status_update",
      content: "Enviando factura al ERP...",
      timestamp: "14:30",
      data: { status: "enviando_erp" },
    },
    {
      id: "msg-11",
      sender: "bot",
      type: "erp_result",
      content: "La factura ha sido enviada y registrada exitosamente en el ERP.",
      timestamp: "14:32",
      data: { erp: demoERPResult },
    },
    {
      id: "msg-12",
      sender: "bot",
      type: "text",
      content:
        "Proceso completado. La factura A-4521 de Tecnologías Avanzadas ha sido procesada, validada, clasificada y enviada al ERP exitosamente. Puedes ver el detalle completo en el panel de contexto. ¿Necesitas procesar otra factura?",
      timestamp: "14:32",
    },
  ]

  const delays = [0, 800, 600, 1200, 1500, 2500, 2000, 2200, 800, 1500, 3000, 1000]

  return { messages, delays }
}

export function getDemoAuditLog(step: number): AuditEntry[] {
  const allEntries: AuditEntry[] = [
    {
      id: "aud-1",
      timestamp: "14:27",
      action: "Factura Recibida",
      detail: "XML cargado: factura_TAV_A4521.xml",
      user: "Sistema",
      status: "info",
    },
    {
      id: "aud-2",
      timestamp: "14:28",
      action: "Validación Completa",
      detail: "6/6 controles aprobados - Score: 98%",
      user: "Motor IA",
      status: "success",
    },
    {
      id: "aud-3",
      timestamp: "14:28",
      action: "Clasificación Automática",
      detail: "Cuenta 6100-001-003 - Confianza: 94%",
      user: "Motor IA",
      status: "success",
    },
    {
      id: "aud-4",
      timestamp: "14:29",
      action: "Recomendación IA",
      detail: "Acción: Aprobar - Confianza: 96%",
      user: "Motor IA",
      status: "success",
    },
    {
      id: "aud-5",
      timestamp: "14:29",
      action: "Alerta",
      detail: "Monto superior a $50,000 MXN",
      user: "Motor IA",
      status: "warning",
    },
    {
      id: "aud-6",
      timestamp: "14:30",
      action: "Aprobación Manual",
      detail: "Factura aprobada por usuario",
      user: "Admin",
      status: "success",
    },
    {
      id: "aud-7",
      timestamp: "14:32",
      action: "Enviada a ERP",
      detail: "ID: ERP-2026-04521 - Cuentas por Pagar",
      user: "Sistema",
      status: "success",
    },
  ]

  // Return entries based on the step
  const stepMap = [0, 1, 2, 3, 5, 5, 6, 7]
  const count = stepMap[Math.min(step, stepMap.length - 1)] || 0
  return allEntries.slice(0, count)
}

export const demoConversations = [
  {
    id: "conv-1",
    title: "Factura TAV A-4521",
    date: "Hoy, 14:25",
    active: true,
  },
  {
    id: "conv-2",
    title: "Lote facturas Feb 2026",
    date: "Ayer, 09:15",
  },
  {
    id: "conv-3",
    title: "Corrección RFC emisor",
    date: "22 Feb, 16:30",
  },
  {
    id: "conv-4",
    title: "Factura rechazada #3891",
    date: "21 Feb, 11:00",
  },
  {
    id: "conv-5",
    title: "Consulta clasificación",
    date: "20 Feb, 08:45",
  },
]

import { NextResponse } from "next/server"

const N8N_WEBHOOK_URL = "https://n8n.comware.com.co/webhook/AGC_WARE"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, conversationId } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "El campo 'message' es requerido." },
        { status: 400 }
      )
    }

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        conversationId: conversationId || null,
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] n8n webhook error:", response.status, errorText)
      return NextResponse.json(
        { error: "Error al comunicarse con el servicio de IA." },
        { status: 502 }
      )
    }

    const contentType = response.headers.get("content-type") || ""
    let data: string

    if (contentType.includes("application/json")) {
      const json = await response.json()
      // n8n can return various shapes - try common patterns
      data =
        json.output ||
        json.response ||
        json.text ||
        json.message ||
        json.reply ||
        json.answer ||
        (typeof json === "string" ? json : JSON.stringify(json))
    } else {
      data = await response.text()
    }

    return NextResponse.json({ reply: data })
  } catch (error) {
    console.error("[v0] API chat error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    )
  }
}

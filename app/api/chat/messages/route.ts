import { NextRequest, NextResponse } from "next/server"
import { getSessionMessages, clearSessionMessages } from "@/lib/db"
import crypto from "crypto"

const COOKIE_NAME = "portfolio_chat_session"

export async function GET(req: NextRequest) {
  let sessionId = req.cookies.get(COOKIE_NAME)?.value
  let isNewSession = false

  if (!sessionId) {
    sessionId = crypto.randomUUID()
    isNewSession = true
  }

  let messages: { id: string; sender: "user" | "bot"; text: string; timestamp: string }[] = []

  try {
    const records = await getSessionMessages(sessionId)
    messages = records.map((r) => ({
      id: r.id,
      sender: r.sender,
      text: r.text,
      timestamp: new Date(r.created_at).toISOString(),
    }))
  } catch {
    // Graceful fallback jika DB belum siap: return pesan kosong
    messages = []
  }

  const res = NextResponse.json({
    success: true,
    sessionId,
    messages,
  })

  if (isNewSession) {
    res.cookies.set({
      name: COOKIE_NAME,
      value: sessionId,
      path: "/",
      maxAge: 60 * 60 * 24 * 90, // 90 days
      httpOnly: true,
      sameSite: "lax",
    })
  }

  return res
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionId = req.cookies.get(COOKIE_NAME)?.value
    if (sessionId) {
      await clearSessionMessages(sessionId)
    }
  } catch {
    // Lewati jika DB offline
  }

  return NextResponse.json({
    success: true,
    message: "Riwayat chat berhasil dibersihkan.",
  })
}

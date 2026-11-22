import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Setup admin dilakukan melalui file environment (.env) dan database seed.',
  })
}

export async function POST() {
  return NextResponse.json(
    {
      error:
        'Setup akun admin melalui form dinonaktifkan. Akun admin otomatis dibuat dari variabel .env.',
    },
    { status: 403 }
  )
}

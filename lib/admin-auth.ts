import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

export const ADMIN_COOKIE = 'admin_token'
const JWT_EXPIRY = '7d'

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET || 'dev-fallback-secret-change-in-prod-32chars'
  return new TextEncoder().encode(secret)
}

export interface AdminJWTPayload extends JWTPayload {
  adminId: number
  username: string
  email: string
}

export async function signAdminToken(
  payload: Omit<AdminJWTPayload, keyof JWTPayload>
): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getSecret())
}

export async function verifyAdminToken(token: string): Promise<AdminJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as AdminJWTPayload
  } catch {
    return null
  }
}

export async function getAdminFromRequest(req: Request): Promise<AdminJWTPayload | null> {
  const cookieHeader = req.headers.get('cookie') || ''
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=')
      return [k, v.join('=')]
    })
  )
  const token = cookies[ADMIN_COOKIE]
  if (!token) return null
  return verifyAdminToken(token)
}

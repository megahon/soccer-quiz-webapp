import { cookies } from 'next/headers'
import { timingSafeEqual } from 'crypto'
import { SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/auth'

export async function POST(request: Request) {
  const { action, password } = await request.json()

  if (action === 'logout') {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE)
    return Response.json({ ok: true })
  }

  if (action === 'login') {
    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
      return Response.json(
        { error: 'ADMIN_PASSWORD が設定されていません' },
        { status: 500 }
      )
    }

    const a = Buffer.from(password)
    const b = Buffer.from(adminPassword)
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return Response.json({ error: 'パスワードが正しくありません' }, { status: 401 })
    }

    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    })
    return Response.json({ ok: true })
  }

  return Response.json({ error: '不正なアクションです' }, { status: 400 })
}

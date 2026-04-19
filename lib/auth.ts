import { cookies } from 'next/headers'

export const SESSION_COOKIE = 'admin_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 // 24時間（秒）

/**
 * リクエストの Cookie を検証し、管理者セッションが有効かどうかを返す。
 * Server Component・Route Handler の両方から呼べる。
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  return session?.value === 'authenticated'
}

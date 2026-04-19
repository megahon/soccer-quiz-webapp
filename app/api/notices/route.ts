import type { NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'
import { isAuthenticated } from '@/lib/auth'
import { getNotices, createNotice, deleteNotice } from '@/lib/db'

export async function GET() {
  const notices = await getNotices()
  return Response.json(notices ?? [])
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: '認証が必要です' }, { status: 401 })
  }

  const { date, text } = await request.json()
  const notice = await createNotice({ date, text })
  revalidateTag('notices', 'max')
  return Response.json(notice, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: '認証が必要です' }, { status: 401 })
  }

  const id = Number(request.nextUrl.searchParams.get('id'))
  await deleteNotice(id)
  revalidateTag('notices', 'max')
  return Response.json({ ok: true })
}

import type { NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'
import { isAuthenticated } from '@/lib/auth'
import { getTeams, createTeam, updateTeam, deleteTeam } from '@/lib/db'
import { DEFAULT_TEAMS } from '@/lib/defaultData'

export async function GET() {
  const teams = await getTeams()
  return Response.json(teams ?? DEFAULT_TEAMS)
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: '認証が必要です' }, { status: 401 })
  }

  const { name, league, colors } = await request.json()
  const team = await createTeam({ name, league, colors })
  revalidateTag('teams', 'max')
  return Response.json(team, { status: 201 })
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: '認証が必要です' }, { status: 401 })
  }

  const { id, name, league, colors } = await request.json()
  const team = await updateTeam(id, { name, league, colors })
  revalidateTag('teams', 'max')
  return Response.json(team)
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: '認証が必要です' }, { status: 401 })
  }

  const id = Number(request.nextUrl.searchParams.get('id'))
  await deleteTeam(id)
  revalidateTag('teams', 'max')
  return Response.json({ ok: true })
}

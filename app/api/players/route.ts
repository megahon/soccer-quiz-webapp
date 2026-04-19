import type { NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'
import { isAuthenticated } from '@/lib/auth'
import { getPlayers, getPlayersByTeam, createPlayer, updatePlayer, deletePlayer } from '@/lib/db'
import { DEFAULT_PLAYERS } from '@/lib/defaultData'

export async function GET(request: NextRequest) {
  const teamId = request.nextUrl.searchParams.get('teamId')
  if (teamId) {
    const id = Number(teamId)
    const players = await getPlayersByTeam(id)
    return Response.json(players ?? DEFAULT_PLAYERS.filter(p => p.teamId === id))
  }
  const players = await getPlayers()
  return Response.json(players ?? DEFAULT_PLAYERS)
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: '認証が必要です' }, { status: 401 })
  }

  const { teamId, num, name, furi, pos } = await request.json()
  const player = await createPlayer({ teamId, num, name, furi, pos })
  revalidateTag(`players-${teamId}`, 'max')
  return Response.json(player, { status: 201 })
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: '認証が必要です' }, { status: 401 })
  }

  const { id, teamId, num, name, furi, pos } = await request.json()
  const player = await updatePlayer(id, { teamId, num, name, furi, pos })
  revalidateTag(`players-${teamId}`, 'max')
  return Response.json(player)
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: '認証が必要です' }, { status: 401 })
  }

  const id = Number(request.nextUrl.searchParams.get('id'))
  const teamId = Number(request.nextUrl.searchParams.get('teamId'))
  await deletePlayer(id)
  if (teamId) revalidateTag(`players-${teamId}`, 'max')
  return Response.json({ ok: true })
}

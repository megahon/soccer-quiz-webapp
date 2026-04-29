import type { NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'
import { isAuthenticated } from '@/lib/auth'
import { getPlayers, getPlayersByTeam, createPlayer, bulkCreatePlayers, updatePlayer, deletePlayer } from '@/lib/db'
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

  const body = await request.json()

  if (Array.isArray(body.players)) {
    const players = await bulkCreatePlayers(body.players)
    const teamIds = [...new Set<number>(body.players.map((p: { teamId: number }) => p.teamId))]
    for (const id of teamIds) revalidateTag(`players-${id}`, 'max')
    return Response.json(players, { status: 201 })
  }

  const { teamId, num, name, furi, pos } = body
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

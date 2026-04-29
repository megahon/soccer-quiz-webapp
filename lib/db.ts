import 'server-only'
import { cacheTag } from 'next/cache'
import { supabaseAdmin } from './supabase'
import type { Team, Player, Notice } from './types'

// Supabase の snake_case カラムを camelCase に変換
function toTeam(row: Record<string, unknown>): Team {
  return {
    id: row.id as number,
    name: row.name as string,
    league: row.league as Team['league'],
    colors: row.colors as Team['colors'],
  }
}

function toPlayer(row: Record<string, unknown>): Player {
  return {
    id: row.id as number,
    teamId: row.team_id as number,
    num: row.num as number,
    name: row.name as string,
    furi: row.furi as string,
    pos: row.pos as Player['pos'],
  }
}

function toNotice(row: Record<string, unknown>): Notice {
  return {
    id: row.id as number,
    date: row.date as string,
    text: row.text as string,
  }
}

// ===========================
// チーム
// ===========================

export async function getTeams(): Promise<Team[] | null> {
  'use cache'
  cacheTag('teams')
  if (!supabaseAdmin) return null
  const { data, error } = await supabaseAdmin
    .from('teams')
    .select('*')
    .order('name')
  if (error) throw new Error(error.message)
  return data.map(toTeam)
}

export async function createTeam(
  data: Omit<Team, 'id'>
): Promise<Team> {
  if (!supabaseAdmin) throw new Error('Supabase is not configured')
  const { data: row, error } = await supabaseAdmin
    .from('teams')
    .insert({ name: data.name, league: data.league, colors: data.colors })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return toTeam(row)
}

export async function updateTeam(
  id: number,
  data: Omit<Team, 'id'>
): Promise<Team> {
  if (!supabaseAdmin) throw new Error('Supabase is not configured')
  const { data: row, error } = await supabaseAdmin
    .from('teams')
    .update({ name: data.name, league: data.league, colors: data.colors })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return toTeam(row)
}

export async function deleteTeam(id: number): Promise<void> {
  if (!supabaseAdmin) throw new Error('Supabase is not configured')
  const { error } = await supabaseAdmin.from('teams').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ===========================
// 選手
// ===========================

export async function getPlayers(): Promise<Player[] | null> {
  if (!supabaseAdmin) return null
  const PAGE = 1000
  const rows: Record<string, unknown>[] = []
  let from = 0
  while (true) {
    const { data, error } = await supabaseAdmin
      .from('players')
      .select('*')
      .order('team_id')
      .order('num')
      .range(from, from + PAGE - 1)
    if (error) throw new Error(error.message)
    if (!data || data.length === 0) break
    rows.push(...data)
    if (data.length < PAGE) break
    from += PAGE
  }
  return rows.map(toPlayer)
}

export async function getPlayersByTeam(teamId: number): Promise<Player[] | null> {
  'use cache'
  cacheTag('players', `players-${teamId}`)
  if (!supabaseAdmin) return null
  const { data, error } = await supabaseAdmin
    .from('players')
    .select('*')
    .eq('team_id', teamId)
    .order('num')
  if (error) throw new Error(error.message)
  return data.map(toPlayer)
}

export async function createPlayer(
  data: Omit<Player, 'id'>
): Promise<Player> {
  if (!supabaseAdmin) throw new Error('Supabase is not configured')
  const { data: row, error } = await supabaseAdmin
    .from('players')
    .insert({
      team_id: data.teamId,
      num: data.num,
      name: data.name,
      furi: data.furi,
      pos: data.pos,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return toPlayer(row)
}

export async function bulkCreatePlayers(
  players: Omit<Player, 'id'>[]
): Promise<Player[]> {
  if (!supabaseAdmin) throw new Error('Supabase is not configured')
  const rows = players.map(p => ({
    team_id: p.teamId,
    num: p.num,
    name: p.name,
    furi: p.furi,
    pos: p.pos,
  }))
  const { data, error } = await supabaseAdmin
    .from('players')
    .insert(rows)
    .select()
  if (error) throw new Error(error.message)
  return data.map(toPlayer)
}

export async function updatePlayer(
  id: number,
  data: Omit<Player, 'id'>
): Promise<Player> {
  if (!supabaseAdmin) throw new Error('Supabase is not configured')
  const { data: row, error } = await supabaseAdmin
    .from('players')
    .update({
      team_id: data.teamId,
      num: data.num,
      name: data.name,
      furi: data.furi,
      pos: data.pos,
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return toPlayer(row)
}

export async function deletePlayer(id: number): Promise<void> {
  if (!supabaseAdmin) throw new Error('Supabase is not configured')
  const { error } = await supabaseAdmin.from('players').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ===========================
// お知らせ
// ===========================

export async function getNotices(): Promise<Notice[] | null> {
  'use cache'
  cacheTag('notices')
  if (!supabaseAdmin) return null
  const { data, error } = await supabaseAdmin
    .from('notices')
    .select('*')
    .order('id', { ascending: false })
  if (error) throw new Error(error.message)
  return data.map(toNotice)
}

export async function createNotice(
  data: Omit<Notice, 'id'>
): Promise<Notice> {
  if (!supabaseAdmin) throw new Error('Supabase is not configured')
  const { data: row, error } = await supabaseAdmin
    .from('notices')
    .insert({ date: data.date, text: data.text })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return toNotice(row)
}

export async function deleteNotice(id: number): Promise<void> {
  if (!supabaseAdmin) throw new Error('Supabase is not configured')
  const { error } = await supabaseAdmin.from('notices').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

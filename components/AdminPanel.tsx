'use client'

import { useState, useEffect, useCallback } from 'react'
import { showToast } from './Toast'
import type { Team, Player, Notice, League, Position } from '@/lib/types'

type Tab = 'teams' | 'players' | 'notices'

const LEAGUES: League[] = ['J1', 'J2', 'J3']
const POSITIONS: Position[] = ['GK', 'DF', 'MF', 'FW']

// ===== ヘルパーコンポーネント =====

function PosBadge({ pos }: { pos: Position }) {
  const map: Record<Position, { bg: string; color: string }> = {
    GK: { bg: 'var(--pos-gk-bg)', color: 'var(--pos-gk-text)' },
    DF: { bg: 'var(--pos-df-bg)', color: 'var(--pos-df-text)' },
    MF: { bg: 'var(--pos-mf-bg)', color: 'var(--pos-mf-text)' },
    FW: { bg: 'var(--pos-fw-bg)', color: 'var(--pos-fw-text)' },
  }
  return (
    <span style={{ padding: '0.15rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 700, backgroundColor: map[pos].bg, color: map[pos].color }}>
      {pos}
    </span>
  )
}

function ColorStripes({ colors }: { colors: [string, string, string] }) {
  return (
    <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
      {colors.map((c, i) => <div key={i} style={{ flex: 1, backgroundColor: c }} />)}
    </div>
  )
}

function LeagueBadge({ league }: { league: League }) {
  const color = { J1: 'var(--j1)', J2: 'var(--j2)', J3: 'var(--j3)' }[league]
  return (
    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0a0a0f', backgroundColor: color, padding: '0.1rem 0.4rem', borderRadius: '0.2rem' }}>
      {league}
    </span>
  )
}

// ===== チーム管理セクション =====

const defaultTeamForm = (): { name: string; league: League; colors: [string, string, string] } => ({
  name: '', league: 'J1', colors: ['#cccccc', '#888888', '#444444'],
})

function TeamSection({ teams, onReload }: { teams: Team[]; onReload: () => void }) {
  const [form, setForm] = useState(defaultTeamForm())
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  function startEdit(team: Team) {
    setEditingId(team.id)
    setForm({ name: team.name, league: team.league, colors: [...team.colors] as [string, string, string] })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(defaultTeamForm())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { id: editingId, ...form } : form
      const res = await fetch('/api/teams', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      showToast(editingId ? 'チームを更新しました' : 'チームを追加しました', 'success')
      setForm(defaultTeamForm())
      setEditingId(null)
      onReload()
    } catch {
      showToast('エラーが発生しました', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(team: Team) {
    if (!window.confirm(`「${team.name}」を削除しますか？\n所属する選手もすべて削除されます。`)) return
    try {
      const res = await fetch(`/api/teams?id=${team.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      showToast('チームを削除しました', 'success')
      onReload()
    } catch {
      showToast('エラーが発生しました', 'error')
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
      {/* 一覧 */}
      <div>
        <h2 style={sH2}>チーム一覧</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {teams.map(team => (
            <div key={team.id} style={sListItem}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <LeagueBadge league={team.league} />
                  <span style={{ fontWeight: 600 }}>{team.name}</span>
                </div>
                <ColorStripes colors={team.colors} />
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                <button onClick={() => startEdit(team)} style={sEditBtn}>編集</button>
                <button onClick={() => handleDelete(team)} style={sDeleteBtn}>削除</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* フォーム */}
      <div style={sFormCard}>
        <h2 style={sH2}>{editingId ? 'チームを編集' : 'チームを追加'}</h2>
        <form onSubmit={handleSubmit} style={sForm}>
          <label style={sLabel}>チーム名</label>
          <input style={sInput} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />

          <label style={sLabel}>リーグ</label>
          <select style={sInput} value={form.league} onChange={e => setForm(f => ({ ...f, league: e.target.value as League }))}>
            {LEAGUES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>

          {([0, 1, 2] as const).map(i => (
            <div key={i}>
              <label style={sLabel}>カラー {i + 1}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="color"
                  style={{ width: '2.5rem', height: '2rem', border: 'none', cursor: 'pointer', background: 'none', padding: 0 }}
                  value={form.colors[i]}
                  onChange={e => {
                    const c = [...form.colors] as [string, string, string]
                    c[i] = e.target.value
                    setForm(f => ({ ...f, colors: c }))
                  }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{form.colors[i]}</span>
              </div>
            </div>
          ))}

          <div>
            <label style={sLabel}>プレビュー</label>
            <ColorStripes colors={form.colors} />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" disabled={loading} style={sPrimaryBtn}>{editingId ? '更新' : '追加'}</button>
            {editingId && <button type="button" onClick={cancelEdit} style={sCancelBtn}>キャンセル</button>}
          </div>
        </form>
      </div>
    </div>
  )
}

// ===== 選手管理セクション =====

function PlayerSection({ players, teams, onReload }: { players: Player[]; teams: Team[]; onReload: () => void }) {
  const [form, setForm] = useState({ teamId: teams[0]?.id ?? 0, num: '', name: '', furi: '', pos: 'GK' as Position })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [filterTeamId, setFilterTeamId] = useState<number | 'all'>('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (form.teamId === 0 && teams.length > 0) {
      setForm(f => ({ ...f, teamId: teams[0].id }))
    }
  }, [teams, form.teamId])

  const filtered = filterTeamId === 'all' ? players : players.filter(p => p.teamId === filterTeamId)
  const teamName = (id: number) => teams.find(t => t.id === id)?.name ?? '-'

  function startEdit(player: Player) {
    setEditingId(player.id)
    setForm({ teamId: player.teamId, num: String(player.num), name: player.name, furi: player.furi, pos: player.pos })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm({ teamId: teams[0]?.id ?? 0, num: '', name: '', furi: '', pos: 'GK' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const data = { ...form, num: parseInt(form.num) }
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { id: editingId, ...data } : data
      const res = await fetch('/api/players', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      showToast(editingId ? '選手を更新しました' : '選手を追加しました', 'success')
      setForm({ teamId: teams[0]?.id ?? 0, num: '', name: '', furi: '', pos: 'GK' })
      setEditingId(null)
      onReload()
    } catch {
      showToast('エラーが発生しました', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(player: Player) {
    if (!window.confirm(`「${player.name}」を削除しますか？`)) return
    try {
      const res = await fetch(`/api/players?id=${player.id}&teamId=${player.teamId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      showToast('選手を削除しました', 'success')
      onReload()
    } catch {
      showToast('エラーが発生しました', 'error')
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
      {/* 一覧 */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <h2 style={{ ...sH2, margin: 0 }}>選手一覧</h2>
          <select
            style={{ ...sInput, width: 'auto', padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
            value={filterTeamId}
            onChange={e => setFilterTeamId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          >
            <option value="all">すべてのチーム</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {filtered.map(player => (
            <div key={player.id} style={sListItem}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--accent)', minWidth: '2.5rem', textAlign: 'center' }}>
                {player.num}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <PosBadge pos={player.pos} />
                  <span style={{ fontWeight: 600 }}>{player.name}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{player.furi}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{teamName(player.teamId)}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                <button onClick={() => startEdit(player)} style={sEditBtn}>編集</button>
                <button onClick={() => handleDelete(player)} style={sDeleteBtn}>削除</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* フォーム */}
      <div style={sFormCard}>
        <h2 style={sH2}>{editingId ? '選手を編集' : '選手を追加'}</h2>
        <form onSubmit={handleSubmit} style={sForm}>
          <label style={sLabel}>チーム</label>
          <select style={sInput} value={form.teamId} onChange={e => setForm(f => ({ ...f, teamId: Number(e.target.value) }))}>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <label style={sLabel}>背番号</label>
          <input type="number" style={sInput} value={form.num} onChange={e => setForm(f => ({ ...f, num: e.target.value }))} required min={1} />

          <label style={sLabel}>選手名</label>
          <input style={sInput} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />

          <label style={sLabel}>ふりがな</label>
          <input style={sInput} value={form.furi} onChange={e => setForm(f => ({ ...f, furi: e.target.value }))} required />

          <label style={sLabel}>ポジション</label>
          <select style={sInput} value={form.pos} onChange={e => setForm(f => ({ ...f, pos: e.target.value as Position }))}>
            {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" disabled={loading} style={sPrimaryBtn}>{editingId ? '更新' : '追加'}</button>
            {editingId && <button type="button" onClick={cancelEdit} style={sCancelBtn}>キャンセル</button>}
          </div>
        </form>
      </div>
    </div>
  )
}

// ===== お知らせ管理セクション =====

function NoticeSection({ notices, onReload }: { notices: Notice[]; onReload: () => void }) {
  const [form, setForm] = useState({ date: '', text: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      showToast('お知らせを追加しました', 'success')
      setForm({ date: '', text: '' })
      onReload()
    } catch {
      showToast('エラーが発生しました', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(notice: Notice) {
    if (!window.confirm('このお知らせを削除しますか？')) return
    try {
      const res = await fetch(`/api/notices?id=${notice.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      showToast('お知らせを削除しました', 'success')
      onReload()
    } catch {
      showToast('エラーが発生しました', 'error')
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
      {/* 一覧 */}
      <div>
        <h2 style={sH2}>お知らせ一覧</h2>
        {notices.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>お知らせはありません</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {notices.map(notice => (
            <div key={notice.id} style={sListItem}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{notice.date}</div>
                <div style={{ fontSize: '0.9rem' }}>{notice.text}</div>
              </div>
              <button onClick={() => handleDelete(notice)} style={{ ...sDeleteBtn, flexShrink: 0 }}>削除</button>
            </div>
          ))}
        </div>
      </div>

      {/* フォーム */}
      <div style={sFormCard}>
        <h2 style={sH2}>お知らせを追加</h2>
        <form onSubmit={handleSubmit} style={sForm}>
          <label style={sLabel}>日付</label>
          <input type="date" style={sInput} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />

          <label style={sLabel}>本文</label>
          <textarea
            style={{ ...sInput, minHeight: '80px', resize: 'vertical' }}
            value={form.text}
            onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
            required
          />

          <button type="submit" disabled={loading} style={sPrimaryBtn}>追加</button>
        </form>
      </div>
    </div>
  )
}

// ===== メインコンポーネント =====

const TAB_LABELS: Record<Tab, string> = {
  teams: 'チーム管理',
  players: '選手管理',
  notices: 'お知らせ管理',
}

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>('teams')
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [notices, setNotices] = useState<Notice[]>([])

  const loadTeams = useCallback(async () => {
    const res = await fetch('/api/teams')
    setTeams(await res.json())
  }, [])

  const loadPlayers = useCallback(async () => {
    const res = await fetch('/api/players')
    setPlayers(await res.json())
  }, [])

  const loadNotices = useCallback(async () => {
    const res = await fetch('/api/notices')
    setNotices(await res.json())
  }, [])

  useEffect(() => { loadTeams() }, [loadTeams])

  useEffect(() => {
    if (tab === 'players') loadPlayers()
    if (tab === 'notices') loadNotices()
  }, [tab, loadPlayers, loadNotices])

  async function logout() {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    })
    window.location.reload()
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      {/* ヘッダー */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 2rem', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: '1.05rem', fontWeight: 700 }}>管理者パネル</h1>
        <button onClick={logout} style={sDeleteBtn}>ログアウト</button>
      </header>

      {/* タブ */}
      <nav style={{ display: 'flex', gap: '0', padding: '0 2rem', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        {(Object.keys(TAB_LABELS) as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: tab === t ? 'var(--accent)' : 'var(--text-muted)',
              fontWeight: tab === t ? 700 : 400,
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'color 0.15s',
            }}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </nav>

      {/* コンテンツ */}
      <main style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
        {tab === 'teams' && <TeamSection teams={teams} onReload={loadTeams} />}
        {tab === 'players' && <PlayerSection players={players} teams={teams} onReload={loadPlayers} />}
        {tab === 'notices' && <NoticeSection notices={notices} onReload={loadNotices} />}
      </main>
    </div>
  )
}

// ===== 共通スタイル =====

const sH2: React.CSSProperties = { fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text)' }

const sListItem: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.75rem',
  padding: '0.7rem 0.9rem',
  backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.5rem',
}

const sFormCard: React.CSSProperties = {
  backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: '0.75rem', padding: '1.25rem',
  position: 'sticky', top: '1rem',
}

const sForm: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.55rem' }

const sLabel: React.CSSProperties = { fontSize: '0.78rem', color: 'var(--text-muted)' }

const sInput: React.CSSProperties = {
  width: '100%', padding: '0.5rem 0.6rem',
  backgroundColor: 'var(--surface2)', border: '1px solid var(--border)',
  borderRadius: '0.375rem', color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
}

const sPrimaryBtn: React.CSSProperties = {
  padding: '0.5rem 1rem', backgroundColor: 'var(--accent)', color: '#0a0a0f',
  fontWeight: 700, border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.9rem',
}

const sEditBtn: React.CSSProperties = {
  padding: '0.3rem 0.6rem', backgroundColor: 'var(--surface2)', color: 'var(--text)',
  border: '1px solid var(--border)', borderRadius: '0.3rem', cursor: 'pointer', fontSize: '0.78rem', whiteSpace: 'nowrap',
}

const sDeleteBtn: React.CSSProperties = {
  padding: '0.3rem 0.6rem', backgroundColor: 'transparent', color: 'var(--danger)',
  border: '1px solid var(--danger)', borderRadius: '0.3rem', cursor: 'pointer', fontSize: '0.78rem', whiteSpace: 'nowrap',
}

const sCancelBtn: React.CSSProperties = {
  padding: '0.5rem 0.75rem', backgroundColor: 'transparent', color: 'var(--text-muted)',
  border: '1px solid var(--border)', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.9rem',
}

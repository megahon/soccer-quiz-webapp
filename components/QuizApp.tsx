'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Team, Player, Notice, League, Position } from '@/lib/types'

type Phase = 'teamSelect' | 'modeSelect' | 'playerList' | 'quiz' | 'result'
type QuizMode = 'order' | 'random' | 'position'
type LeagueFilter = League

interface Score { correct: number; skip: number }

export interface QuizAppProps {
  teams: Team[]
  notices: Notice[]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQuestions(players: Player[], teamId: number, mode: QuizMode, pos: Position | null): Player[] {
  let list = players.filter(p => p.teamId === teamId)
  if (mode === 'position' && pos) list = list.filter(p => p.pos === pos)
  if (mode === 'random') return shuffle(list)
  return [...list].sort((a, b) => a.num - b.num)
}

const LEAGUE_COLORS: Record<League, string> = { J1: 'var(--j1)', J2: 'var(--j2)', J3: 'var(--j3)' }

const POS_COLORS: Record<Position, { bg: string; text: string }> = {
  GK: { bg: 'var(--pos-gk-bg)', text: 'var(--pos-gk-text)' },
  DF: { bg: 'var(--pos-df-bg)', text: 'var(--pos-df-text)' },
  MF: { bg: 'var(--pos-mf-bg)', text: 'var(--pos-mf-text)' },
  FW: { bg: 'var(--pos-fw-bg)', text: 'var(--pos-fw-text)' },
}

export default function QuizApp({ teams, notices }: QuizAppProps) {
  const [phase, setPhase] = useState<Phase>('teamSelect')
  const [leagueFilter, setLeagueFilter] = useState<LeagueFilter>('J1')
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [quizMode, setQuizMode] = useState<QuizMode | null>(null)
  const [selectedPos, setSelectedPos] = useState<Position | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [playersLoading, setPlayersLoading] = useState(false)
  const [questions, setQuestions] = useState<Player[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState<Score>({ correct: 0, skip: 0 })

  const filteredTeams = useMemo(() => {
    return teams.filter(t => t.league === leagueFilter).sort((a, b) => a.name.localeCompare(b.name, 'ja'))
  }, [teams, leagueFilter])

  function selectTeam(team: Team) {
    setSelectedTeam(team)
    setQuizMode(null)
    setSelectedPos(null)
    setPlayers([])
    setPlayersLoading(true)
    setPhase('modeSelect')
    fetch(`/api/players?teamId=${team.id}`)
      .then(r => r.json())
      .then((data: Player[]) => setPlayers(data))
      .finally(() => setPlayersLoading(false))
  }

  function startQuiz() {
    if (!selectedTeam || !quizMode) return
    const qs = buildQuestions(players, selectedTeam.id, quizMode, selectedPos)
    setQuestions(qs)
    setCurrentIndex(0)
    setRevealed(false)
    setScore({ correct: 0, skip: 0 })
    setPhase('quiz')
  }

  function handleCorrect() {
    setScore(s => ({ ...s, correct: s.correct + 1 }))
    advance()
  }

  function handleSkip() {
    setScore(s => ({ ...s, skip: s.skip + 1 }))
    advance()
  }

  function advance() {
    if (currentIndex + 1 >= questions.length) {
      setPhase('result')
    } else {
      setCurrentIndex(i => i + 1)
      setRevealed(false)
    }
  }

  function backToTeamSelect() {
    setPhase('teamSelect')
    setSelectedTeam(null)
    setQuizMode(null)
    setSelectedPos(null)
  }

  const appTitle = (
    <button
      onClick={backToTeamSelect}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--accent)', letterSpacing: '0.03em', lineHeight: 1, transition: 'opacity 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '0.75' }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
    >
      Jリーグ背番号クイズ
    </button>
  )

  // ===== チーム選択 =====
  if (phase === 'teamSelect') {
    return (
      <div style={sPage}>
        <div style={sFixedHeader}>{appTitle}</div>
        {/* お知らせバナー */}
        {notices.length > 0 && (
          <div style={sNoticeBanner}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {notices.slice(0, 2).map(n => (
                <div key={n.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{n.date}</span>
                  <span style={{ fontSize: '0.85rem' }}>{n.text}</span>
                </div>
              ))}
            </div>
            {notices.length > 2 && (
              <Link href="/notices" style={{ fontSize: '0.8rem', color: 'var(--accent)', marginTop: '0.25rem', display: 'inline-block' }}>
                もっと見る →
              </Link>
            )}
          </div>
        )}

        {/* タイトル */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Jリーグ背番号クイズ</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>チームを選んでスタート</p>
        </div>

        {/* リーグフィルター */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          {(['J1', 'J2', 'J3'] as const).map(l => {
            const active = leagueFilter === l
            const color = LEAGUE_COLORS[l]
            return (
              <button
                key={l}
                onClick={() => setLeagueFilter(l)}
                style={{
                  padding: '0.4rem 1.1rem', borderRadius: '2rem',
                  border: `2px solid ${active ? color : 'var(--border)'}`,
                  backgroundColor: active ? color : 'transparent',
                  color: active ? '#0a0a0f' : 'var(--text-muted)',
                  fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.15s',
                }}
              >
                {l}
              </button>
            )
          })}
        </div>

        {/* チームカードグリッド */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '0.875rem', maxWidth: '860px', margin: '0 auto', width: '100%' }}>
          {filteredTeams.map(team => (
            <button
              key={team.id}
              onClick={() => selectTeam(team)}
              style={{
                backgroundColor: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: '0.75rem', padding: '0.875rem 0.75rem',
                cursor: 'pointer', textAlign: 'left', color: 'var(--text)',
                transition: 'border-color 0.15s, transform 0.1s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {/* カラーストライプ */}
              <div style={{ display: 'flex', height: '20px', borderRadius: '5px', overflow: 'hidden', marginBottom: '0.65rem' }}>
                {team.colors.map((c, i) => <div key={i} style={{ flex: 1, backgroundColor: c }} />)}
              </div>
              {/* リーグバッジ */}
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#0a0a0f', backgroundColor: LEAGUE_COLORS[team.league], padding: '0.1rem 0.35rem', borderRadius: '0.2rem', display: 'inline-block', marginBottom: '0.4rem' }}>
                {team.league}
              </span>
              {/* チーム名 */}
              <div style={{ fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.35 }}>{team.name}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ===== モード選択 =====
  if (phase === 'modeSelect') {
    const canStart = !playersLoading && (quizMode === 'position' ? selectedPos !== null : quizMode !== null)
    return (
      <div style={{ ...sPage, alignItems: 'center', justifyContent: 'center' }}>
        <div style={sFixedHeader}>{appTitle}</div>
        <div style={{ maxWidth: '380px', width: '100%' }}>
          <button onClick={() => setPhase('teamSelect')} style={sBackBtn}>← チーム選択に戻る</button>
          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '1rem', padding: '2rem' }}>
            {/* チーム情報 */}
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', height: '20px', borderRadius: '5px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                {selectedTeam?.colors.map((c, i) => <div key={i} style={{ flex: 1, backgroundColor: c }} />)}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedTeam?.name}</div>
            </div>

            {/* モード選択 */}
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>モードを選択</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem' }}>
              {([
                { mode: 'order' as QuizMode, label: '背番号順' },
                { mode: 'random' as QuizMode, label: 'ランダム' },
                { mode: 'position' as QuizMode, label: 'ポジション別' },
              ]).map(({ mode, label }) => (
                <button
                  key={mode}
                  onClick={() => { setQuizMode(mode); setSelectedPos(null) }}
                  style={{
                    padding: '0.7rem 1rem', borderRadius: '0.5rem', border: '2px solid',
                    borderColor: quizMode === mode ? 'var(--accent)' : 'var(--border)',
                    backgroundColor: quizMode === mode ? 'rgba(232,255,71,0.08)' : 'transparent',
                    color: quizMode === mode ? 'var(--accent)' : 'var(--text)',
                    fontWeight: 600, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (quizMode !== mode) {
                      e.currentTarget.style.borderColor = 'var(--text-muted)'
                      e.currentTarget.style.color = 'var(--text)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (quizMode !== mode) {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.color = 'var(--text)'
                    }
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ポジション選択 */}
            {quizMode === 'position' && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>ポジションを選択</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  {(['GK', 'DF', 'MF', 'FW'] as Position[]).map(pos => (
                    <button
                      key={pos}
                      onClick={() => setSelectedPos(pos)}
                      style={{
                        padding: '0.6rem', borderRadius: '0.4rem', border: '2px solid',
                        borderColor: selectedPos === pos ? POS_COLORS[pos].text : 'var(--border)',
                        backgroundColor: selectedPos === pos ? POS_COLORS[pos].bg : 'transparent',
                        color: selectedPos === pos ? POS_COLORS[pos].text : 'var(--text-muted)',
                        fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        if (selectedPos !== pos) {
                          e.currentTarget.style.borderColor = POS_COLORS[pos].text
                          e.currentTarget.style.color = POS_COLORS[pos].text
                        }
                      }}
                      onMouseLeave={e => {
                        if (selectedPos !== pos) {
                          e.currentTarget.style.borderColor = 'var(--border)'
                          e.currentTarget.style.color = 'var(--text-muted)'
                        }
                      }}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* スタートボタン */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={startQuiz}
                disabled={!canStart}
                style={{
                  width: '100%', padding: '0.8rem', border: 'none', borderRadius: '0.5rem',
                  backgroundColor: canStart ? 'var(--accent)' : 'var(--border)',
                  color: canStart ? '#0a0a0f' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '1rem', cursor: canStart ? 'pointer' : 'not-allowed', transition: 'background-color 0.15s',
                }}
              >
                {playersLoading ? '読み込み中...' : 'スタート'}
              </button>
              <button
                onClick={() => setPhase('playerList')}
                disabled={playersLoading}
                style={{
                  width: '100%', padding: '0.7rem', border: '1px solid var(--border)', borderRadius: '0.5rem',
                  backgroundColor: 'transparent', color: 'var(--text-muted)',
                  fontWeight: 600, fontSize: '0.9rem', cursor: playersLoading ? 'not-allowed' : 'pointer',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.color = 'var(--text)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                選手一覧を確認する
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===== 選手一覧 =====
  if (phase === 'playerList') {
    const byPos: Record<Position, Player[]> = { GK: [], DF: [], MF: [], FW: [] }
    for (const p of players) byPos[p.pos].push(p)

    return (
      <div style={{ ...sPage, alignItems: 'center' }}>
        <div style={sFixedHeader}>{appTitle}</div>
        <div style={{ maxWidth: '480px', width: '100%' }}>
          <button onClick={() => setPhase('modeSelect')} style={sBackBtn}>← モード選択に戻る</button>

          {/* チーム情報 */}
          <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', height: '20px', borderRadius: '5px', overflow: 'hidden', marginBottom: '0.6rem' }}>
              {selectedTeam?.colors.map((c, i) => <div key={i} style={{ flex: 1, backgroundColor: c }} />)}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedTeam?.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{players.length}名</div>
          </div>

          {/* ポジション別一覧 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {(['GK', 'DF', 'MF', 'FW'] as Position[]).map(pos => {
              const list = byPos[pos]
              if (list.length === 0) return null
              return (
                <div key={pos}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    marginBottom: '0.5rem',
                  }}>
                    <span style={{
                      padding: '0.2rem 0.65rem', borderRadius: '0.25rem', fontSize: '0.83rem', fontWeight: 700,
                      backgroundColor: POS_COLORS[pos].bg, color: POS_COLORS[pos].text,
                    }}>
                      {pos}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{list.length}名</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {list.sort((a, b) => a.num - b.num).map(p => (
                      <div key={p.id} style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        backgroundColor: 'var(--surface2)', border: '1px solid var(--border)',
                        borderRadius: '0.5rem', padding: '0.55rem 0.85rem',
                      }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--accent)', minWidth: '2rem', textAlign: 'center', lineHeight: 1 }}>
                          {p.num}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.furi}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ===== クイズ =====
  if (phase === 'quiz') {
    const current = questions[currentIndex]
    if (!current) return null
    const remaining = questions.length - currentIndex - 1

    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        {/* スコアバー */}
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)',
          padding: '0.65rem 1.5rem',
          display: 'flex', gap: '1.5rem', alignItems: 'center',
          fontSize: '0.83rem', zIndex: 100,
        }}>
          <div style={{ flex: '0 0 auto' }}>{appTitle}</div>
          <div style={{ flex: 1, display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-muted)' }}>問題 <strong style={{ color: 'var(--text)' }}>{currentIndex + 1}/{questions.length}</strong></span>
            <span style={{ color: 'var(--text-muted)' }}>スキップ <strong style={{ color: 'var(--text)' }}>{score.skip}</strong></span>
            <span style={{ color: 'var(--text-muted)' }}>残り <strong style={{ color: 'var(--text)' }}>{remaining}</strong></span>
          </div>
        </div>

        {/* クイズカード */}
        <div style={{
          marginTop: '3.5rem', maxWidth: '340px', width: '100%',
          backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '1.25rem', padding: '2rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{selectedTeam?.name}</div>

          {/* 背番号 */}
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '7rem', lineHeight: 1, color: 'var(--accent)', marginBottom: '1.25rem' }}>
            {current.num}
          </div>

          {/* 正解表示エリア */}
          <div style={{ minHeight: '4.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            {revealed && (
              <>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{current.name}</div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{current.furi}</div>
                <span style={{
                  display: 'inline-block', padding: '0.2rem 0.65rem', borderRadius: '0.25rem',
                  fontSize: '0.83rem', fontWeight: 700,
                  backgroundColor: POS_COLORS[current.pos].bg, color: POS_COLORS[current.pos].text,
                }}>
                  {current.pos}
                </span>
              </>
            )}
          </div>

          {/* ボタン */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {!revealed && (
              <button
                onClick={() => setRevealed(true)}
                style={{ padding: '0.75rem', border: 'none', borderRadius: '0.5rem', backgroundColor: 'var(--accent2)', color: '#0a0a0f', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', transition: 'opacity 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.8' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                正解を見る
              </button>
            )}
            <button
              onClick={revealed ? advance : handleSkip}
              style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '0.5rem', backgroundColor: 'transparent', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', transition: 'border-color 0.15s, color 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              次へ
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===== 結果 =====
  const rate = questions.length > 0 ? Math.round((score.correct / questions.length) * 100) : 0
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={sFixedHeader}>{appTitle}</div>
      <div style={{
        maxWidth: '340px', width: '100%',
        backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '1.25rem', padding: '2rem', textAlign: 'center',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '2rem', marginTop: '0' }}>
          {[
            { label: '出題数', value: questions.length, color: 'var(--text)' },
            { label: 'スキップ', value: score.skip, color: 'var(--text-muted)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ backgroundColor: 'var(--surface2)', borderRadius: '0.5rem', padding: '0.75rem 0.25rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <button
            onClick={() => { if (selectedTeam && quizMode) startQuiz() }}
            style={{ padding: '0.75rem', border: 'none', borderRadius: '0.5rem', backgroundColor: 'var(--accent)', color: '#0a0a0f', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}
          >
            もう一度
          </button>
          <button
            onClick={backToTeamSelect}
            style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '0.5rem', backgroundColor: 'transparent', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}
          >
            チームを選び直す
          </button>
        </div>
      </div>
    </div>
  )
}

const sPage: React.CSSProperties = {
  display: 'flex', flexDirection: 'column',
  padding: '4rem 1rem 2rem', backgroundColor: 'var(--bg)', minHeight: '100vh',
}

const sFixedHeader: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0,
  height: '2.5rem',
  backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)',
  display: 'flex', alignItems: 'center', padding: '0 1.25rem',
  zIndex: 100,
}

const sNoticeBanner: React.CSSProperties = {
  maxWidth: '860px', width: '100%', margin: '0 auto 1.5rem',
  backgroundColor: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: '0.5rem', padding: '0.75rem 1rem',
}

const sBackBtn: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--text-muted)',
  cursor: 'pointer', fontSize: '0.85rem', padding: '0 0 0.875rem 0', display: 'block',
}

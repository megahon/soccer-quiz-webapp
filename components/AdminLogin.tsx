'use client'

import { useState } from 'react'
import { showToast } from './Toast'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', password }),
      })

      if (res.ok) {
        showToast('ログインしました', 'success')
        window.location.reload()
      } else {
        const data = await res.json()
        setError(data.error ?? 'ログインに失敗しました')
      }
    } catch {
      setError('通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>管理者ログイン</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label} htmlFor="password">
            パスワード
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg)',
    padding: '1rem',
  },
  card: {
    width: '100%',
    maxWidth: '360px',
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '0.75rem',
    padding: '2rem',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text)',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  label: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  input: {
    width: '100%',
    padding: '0.6rem 0.75rem',
    backgroundColor: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: '0.4rem',
    color: 'var(--text)',
    fontSize: '1rem',
    outline: 'none',
  },
  error: {
    fontSize: '0.85rem',
    color: 'var(--danger)',
  },
  button: {
    marginTop: '0.5rem',
    padding: '0.65rem',
    backgroundColor: 'var(--accent)',
    color: '#0a0a0f',
    fontWeight: 700,
    fontSize: '1rem',
    border: 'none',
    borderRadius: '0.4rem',
    cursor: 'pointer',
    opacity: 1,
    transition: 'opacity 0.15s',
  },
}

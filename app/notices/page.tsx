import type { Metadata } from 'next'
import Link from 'next/link'
import { getNotices } from '@/lib/db'

export const metadata: Metadata = {
  title: 'お知らせ',
  description: 'Jリーグ背番号クイズのお知らせ一覧です。',
}

export default async function NoticesPage() {
  const notices = await getNotices() ?? []

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <Link href="/" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'inline-block', marginBottom: '1.5rem' }}>
          ← ホームに戻る
        </Link>

        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>お知らせ</h1>

        {notices.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>お知らせはありません</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notices.map(n => (
              <div
                key={n.id}
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.875rem 1rem' }}
              >
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>{n.date}</div>
                <div style={{ fontSize: '0.95rem' }}>{n.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

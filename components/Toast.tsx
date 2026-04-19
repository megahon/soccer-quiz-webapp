'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

type ToastType = 'success' | 'error'

interface ToastState {
  message: string
  type: ToastType
  id: number
}

// モジュールレベルのシングルトン — どこからでも show() を呼べる
let _show: ((message: string, type: ToastType) => void) | null = null

export function showToast(message: string, type: ToastType = 'success') {
  _show?.(message, type)
}

export default function Toast() {
  const [toast, setToast] = useState<ToastState | null>(null)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback((message: string, type: ToastType) => {
    // 既存タイマーをキャンセルして即座に上書き
    if (timerRef.current) clearTimeout(timerRef.current)

    setToast({ message, type, id: Date.now() })
    setVisible(true)

    timerRef.current = setTimeout(() => {
      setVisible(false)
    }, 3000)
  }, [])

  // シングルトン関数を登録・クリーンアップ
  useEffect(() => {
    _show = show
    return () => {
      _show = null
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [show])

  if (!toast) return null

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        padding: '0.75rem 1.25rem',
        borderRadius: '0.5rem',
        fontSize: '0.9rem',
        fontWeight: 700,
        color: '#0a0a0f',
        backgroundColor: toast.type === 'success' ? 'var(--accent)' : 'var(--danger)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(0.5rem)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        pointerEvents: 'none',
      }}
    >
      {toast.message}
    </div>
  )
}

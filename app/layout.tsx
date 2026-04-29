import type { Metadata } from 'next'
import { Noto_Sans_JP, Bebas_Neue } from 'next/font/google'
import './globals.css'
import Toast from '@/components/Toast'
import { Analytics } from '@vercel/analytics/react'

const notoSansJP = Noto_Sans_JP({
  variable: '--font-noto-sans-jp',
  subsets: ['latin'],
  weight: ['400', '700'],
})

const bebasNeue = Bebas_Neue({
  variable: '--font-bebas-neue',
  subsets: ['latin'],
  weight: '400',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://soccer-quiz-webapp.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Jリーグ背番号クイズ',
    template: '%s | Jリーグ背番号クイズ',
  },
  description: 'Jリーグの選手名を背番号から当てるクイズアプリ。J1・J2・J3の全チームに対応。背番号順・ランダム・ポジション別の3モードで楽しく暗記できます。',
  keywords: ['Jリーグ', '背番号', 'クイズ', 'サッカー', 'J1', 'J2', 'J3', '選手', '暗記'],
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: siteUrl,
    siteName: 'Jリーグ背番号クイズ',
    title: 'Jリーグ背番号クイズ',
    description: 'Jリーグの選手名を背番号から当てるクイズアプリ。J1・J2・J3の全チームに対応。',
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${bebasNeue.variable}`}>
      <body>
        {children}
        <Toast />
        <Analytics />
      </body>
    </html>
  )
}

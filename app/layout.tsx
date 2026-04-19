import type { Metadata } from 'next'
import { Noto_Sans_JP, Bebas_Neue } from 'next/font/google'
import './globals.css'
import Toast from '@/components/Toast'

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

export const metadata: Metadata = {
  title: 'Jリーグ背番号クイズ',
  description: 'Jリーグ選手の背番号を暗記するためのクイズアプリ',
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
      </body>
    </html>
  )
}

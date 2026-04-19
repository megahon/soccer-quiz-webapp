# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

---

## プロジェクト概要

Jリーグ選手の背番号を暗記するためのクイズWebアプリ。背番号を見て選手名を思い浮かべ、正解ボタンで答え合わせをする学習ツール。

---

## コマンド

```bash
npm run dev    # 開発サーバー起動 (localhost:3000)
npm run build  # 本番ビルド
npm run lint   # ESLint
npm start      # 本番ビルドのサーブ
```

テストランナーは未設定。

---

## 技術スタック

| 項目 | 内容 |
|---|---|
| フレームワーク | Next.js（App Router）|
| 言語 | TypeScript（strict mode） |
| DB | Supabase（PostgreSQL） |
| デプロイ | Vercel |
| スタイル | グローバルCSS変数のみ（Tailwind は使わない） |
| フォント | Noto Sans JP / Bebas Neue（Google Fonts） |

> **注意**: このプロジェクトのNext.jsは破壊的変更を含む可能性がある。AGENTS.mdの指示に従い、Next.js固有のコードを書く前に `node_modules/next/dist/docs/` を参照すること。

---

## ファイル構成

```
app/
├── layout.tsx              # ルートレイアウト
├── page.tsx                # トップページ（SSR → QuizApp に渡す）
├── globals.css             # グローバルCSS変数・共通スタイル
├── admin/page.tsx          # 管理者画面（Cookie認証 → AdminPanel or AdminLogin）
├── notices/page.tsx        # お知らせ一覧ページ
└── api/
    ├── auth/route.ts       # POST: ログイン・ログアウト
    ├── teams/route.ts      # GET/POST/PUT/DELETE
    ├── players/route.ts    # GET/POST/PUT/DELETE
    └── notices/route.ts    # GET/POST/DELETE
components/
├── QuizApp.tsx             # ユーザー向けクイズUI全体（"use client"）
├── AdminPanel.tsx          # 管理者パネル（"use client"）
├── AdminLogin.tsx          # 管理者ログインフォーム
└── Toast.tsx               # トースト通知（グローバルシングルトン）
lib/
├── types.ts                # 型定義（Team / Player / Notice）
├── supabase.ts             # Supabaseクライアント（admin用・公開用）
├── db.ts                   # DB操作関数（getTeams, createPlayer, etc.）
├── auth.ts                 # Cookie認証ヘルパー
└── defaultData.ts          # J1全18チーム・180名のサンプルデータ
supabase/
└── schema.sql              # テーブル定義
```

---

## データモデル

### TypeScript型（`lib/types.ts`）

```ts
interface Team {
  id: number
  name: string
  league: 'J1' | 'J2' | 'J3'
  colors: [string, string, string]
}

interface Player {
  id: number
  teamId: number
  num: number
  name: string
  furi: string
  pos: 'GK' | 'DF' | 'MF' | 'FW'
}

interface Notice {
  id: number
  date: string
  text: string
}
```

### Supabaseテーブル構造（`supabase/schema.sql`）

- `teams`: id, name, league（J1/J2/J3）, colors（text[]、3色）
- `players`: id, team_id（FK→teams）, num, name, furi, pos（GK/DF/MF/FW）
- `notices`: id, date, text

---

## 環境変数

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=    # サーバーサイド専用
ADMIN_PASSWORD=
```

Supabase未設定時は `lib/defaultData.ts` のデータが表示される（読み取り専用フォールバック）。

---

## APIルート

| メソッド | エンドポイント | 管理者認証 |
|---|---|---|
| POST | `/api/auth` | 不要 |
| GET/POST/PUT/DELETE | `/api/teams` | GET以外は必要 |
| GET/POST/PUT/DELETE | `/api/players` | GET以外は必要 |
| GET/POST/DELETE | `/api/notices` | GET以外は必要 |

管理者認証はHTTP-only Cookieで管理（24時間有効）。

---

## デザインシステム

CSSグローバル変数（Tailwindは使用しない）:

```css
--bg: #0a0a0f          /* 背景 */
--surface: #13131a     /* カード背景 */
--surface2: #1c1c28    /* 入力フォーム背景 */
--border: #2a2a3a      /* ボーダー */
--accent: #e8ff47      /* メインアクセント（黄緑） */
--accent2: #4af0c4     /* サブアクセント（ターコイズ） */
--text: #f0f0f8        /* メインテキスト */
--text-muted: #6b6b88  /* ミュートテキスト */
--danger: #ff4a6e      /* 削除・エラー */
--j1: #e8ff47  --j2: #4af0c4  --j3: #ff9a4a  /* リーグバッジ色 */
```

ポジション配色: GK=赤, DF=ターコイズ, MF=黄緑, FW=オレンジ（各rgba 0.18透過背景）

チームカード: 縦3分割カラーストライプ＋リーグバッジ＋チーム名のみ（都市名・絵文字なし）。

---

## 主要な設計上の注意点

- 管理者画面（`/admin`）へのリンクはUI上に一切表示しない。直接URL入力でのみアクセス。
- `SUPABASE_SERVICE_ROLE_KEY` はサーバーサイド（`lib/db.ts`）でのみ使用し、クライアントには渡さない。
- クイズUI（`QuizApp.tsx`）はクライアントコンポーネント。`page.tsx` でSSR後にpropsとして渡す。
- サンプルデータ（`lib/defaultData.ts`）はJ1全18チーム×10名（GK×1・DF×3・MF×4・FW×2）の計180名。

---

## Next.js ベストプラクティス（このバージョン固有）

### `params` / `searchParams` は必ず await する

`page.tsx` や `layout.tsx`、Route Handler の `params` は **Promise** になった（v15以降の破壊的変更）。

```ts
// ✅ 正しい
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}

// ❌ 誤り（以前の書き方）
export default function Page({ params }: { params: { id: string } }) {
  const { id } = params  // エラー
}
```

`cookies()` / `headers()` も同様に await が必要。

```ts
import { cookies } from 'next/headers'
const cookieStore = await cookies()  // ✅ await 必須
```

### `"use client"` はバウンダリにだけ付ける

`"use client"` は「サーバー/クライアントの境界」を定義するもの。そのファイル配下は自動的にクライアントコンポーネントになるため、すべてのファイルに付ける必要はない。

- インタラクション・状態（`useState`, `useEffect`）・ブラウザAPIが必要なコンポーネントのみに付ける
- Server Component から Client Component に渡す props は **シリアライズ可能な値のみ**（関数は渡せない）

### Route Handler は Web 標準 API を使う

```ts
// app/api/teams/route.ts
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const id = searchParams.get('id')
  return Response.json({ id })
}

export async function POST(request: Request) {
  const body = await request.json()
  return Response.json({ ok: true }, { status: 201 })
}
```

- `NextResponse` より `Response` / `Response.json()` を優先（Web標準）
- クエリパラメータは `request.nextUrl.searchParams` で取得
- GET ハンドラのデフォルトキャッシュは **dynamic（キャッシュなし）** に変更された

### サーバーサイドのデータアクセスはサーバー専用モジュールに集約

`lib/db.ts` はサーバーサイド専用。誤ってクライアントにバンドルされないよう、ファイル先頭に `import 'server-only'` を付けることを推奨。

```ts
// lib/db.ts
import 'server-only'
// ... Supabase service role key を使う処理
```

### Server Actions（`'use server'`）vs Route Handler の使い分け

| 用途 | 推奨 |
|---|---|
| フォーム送信・データ変更 | Server Actions（`'use server'`） |
| 外部からも叩けるAPI・RESTが必要 | Route Handler（`route.ts`） |

このプロジェクトでは管理画面の操作を Route Handler 経由で行う設計なので、Route Handler を使う。

### `next/image` より通常の `<img>` でも可

このプロジェクトはチーム画像を使用しない設計のため `next/image` は不要。外部画像を使う場合は `next.config.ts` に `images.remotePatterns` の設定が必要になる点に注意。

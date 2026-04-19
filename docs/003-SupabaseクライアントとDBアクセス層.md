# 003 - Supabase クライアントと DB アクセス層

Supabase への接続設定と、全 DB 操作を集約したアクセス層を作成する。

## 対象ファイル

- `lib/supabase.ts`
- `lib/db.ts`

---

## Todo

- [×] `lib/supabase.ts` を作成
  - [×] 公開用クライアントを作成（`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`）
  - [×] 管理用クライアントを作成（`SUPABASE_SERVICE_ROLE_KEY`）
  - [×] 管理用クライアントはサーバーサイド専用として export する
- [×] `lib/db.ts` を作成
  - [×] `import 'server-only'` をファイル先頭に付ける
  - [×] チーム操作
    - [×] `getTeams()` — 全チーム取得
    - [×] `createTeam(data)` — チーム追加
    - [×] `updateTeam(id, data)` — チーム更新
    - [×] `deleteTeam(id)` — チーム削除（選手も cascade 削除）
  - [×] 選手操作
    - [×] `getPlayers()` — 全選手取得
    - [×] `createPlayer(data)` — 選手追加
    - [×] `updatePlayer(id, data)` — 選手更新
    - [×] `deletePlayer(id)` — 選手削除
  - [×] お知らせ操作
    - [×] `getNotices()` — お知らせ取得
    - [×] `createNotice(data)` — お知らせ追加
    - [×] `deleteNotice(id)` — お知らせ削除
  - [×] Supabase 未設定時（環境変数なし）は `null` を返すか `defaultData` にフォールバックする設計にする

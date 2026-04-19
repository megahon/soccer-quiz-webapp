# 014 - /admin ページ

管理者画面のルートページ。Cookie 認証の有無で `AdminLogin` か `AdminPanel` を切り替えて表示する。

## 対象ファイル

- `app/admin/page.tsx`

---

## Todo

- [×] `app/admin/page.tsx` を作成（Server Component）
  - [×] `cookies()` を `await` して認証 Cookie を取得（Next.js このバージョンの破壊的変更）
  - [×] `lib/auth.ts` の `isAuthenticated()` で認証状態を判定
  - [×] 認証済み → `<AdminPanel />` を表示
  - [×] 未認証 → `<AdminLogin />` を表示
  - [×] このページへのリンクをヘッダー等の UI に表示しない（直接 URL 入力専用）

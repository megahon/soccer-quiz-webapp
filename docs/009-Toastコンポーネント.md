# 009 - Toast コンポーネント

操作成功・失敗を一時的に通知するトースト UI を実装する。グローバルシングルトンとして使う。

## 対象ファイル

- `components/Toast.tsx`

---

## Todo

- [×] `components/Toast.tsx` を作成（`"use client"`）
  - [×] トーストの表示状態を `useState` で管理
  - [×] `show(message, type)` を外部から呼べるよう `useImperativeHandle` or モジュールレベルの関数として公開
  - [×] `type` は `'success'` / `'error'` の 2 種類
  - [×] 一定時間（例: 3 秒）後に自動で非表示
  - [×] `--accent`（成功）/ `--danger`（エラー）のカラーを CSS 変数から使う
  - [×] 画面右下または上部にオーバーレイ表示
  - [×] アニメーション（フェードイン・アウト）を付ける

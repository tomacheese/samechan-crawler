# GitHub Copilot Instructions

GitHub Copilot のコードレビュー向けの指針。レビュー時に重点確認すべき点と、フラグすべきでない既知パターンをまとめる。

## プロジェクト概要（レビュー時の前提）

Twitter アカウント「SameGauu」のツイートを取得し、Discord に通知するクローラー。TypeScript / Node.js / pnpm 構成で、自動テストは未導入。

## レビューで重点的に確認する点

- **機密情報の漏洩**: `data/config.json` には Twitter 認証情報や Discord の Webhook URL / Bot Token が含まれる。これらの値や新たな秘密情報がコード・ログ出力・コミットに混入していないか。
- **型安全性**: `skipLibCheck` の有効化や `any` による型チェック回避が持ち込まれていないか。
- **エラーハンドリング**: スクレイピングや Discord 通知の失敗を握りつぶしていないか。エラーメッセージは英語か。
- **重複通知の防止**: 通知済み管理（`data/notified.json` / `Notified` クラス）を迂回する変更になっていないか。
- **docstring**: 追加・変更された関数やインターフェースに日本語の JSDoc があるか。

## 規約（lint / formatter で強制）

- ESLint（`@book000/eslint-config`）と Prettier に従う。`pnpm lint` で prettier / eslint / tsc が実行される。
- 日本語と英数字の間には半角スペースを入れる。
- PR とコミットは [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) に従い、`<description>` は日本語で記載する。

## フラグすべきでない既知パターン

- `cycletls` による JA3 フィンガープリント偽装や独自の HTTP ヘッダー設定は本プロジェクトの仕様であり、脆弱性ではない。
- プロキシ設定（`PROXY_SERVER`, `PROXY_USERNAME`, `PROXY_PASSWORD`）を環境変数から読み込むのは意図的な設計。

## テスト方針

自動テストは未導入。テストが存在しないこと自体を PR ごとに指摘する必要はないが、テスト容易性を著しく損なう設計は指摘してよい。

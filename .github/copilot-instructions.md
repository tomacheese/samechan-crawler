# GitHub Copilot Instructions

## プロジェクト概要
- 目的: Twitter アカウント「SameGauu」のツイートを取得し、Discord に投稿する
- 主な機能: 指定した Twitter アカウントのツイートを定期的に取得、新しいツイートを Discord に通知、重複通知防止
- 対象ユーザー: 開発者、運用者

## 共通ルール
- 会話は日本語で行う。
- PR とコミットは [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) に従う。
  - `<type>(<scope>): <description>` 形式で、`<description>` は日本語で記載する。
- 日本語と英数字の間には半角スペースを入れる。

## 技術スタック
- 言語: TypeScript
- 実行環境: Node.js
- パッケージマネージャー: yarn
- 主要ライブラリ:
  - `@the-convocation/twitter-scraper`: Twitter データの取得
  - `cycletls`: HTTP クライアント（JA3 フィンガープリント対応）
  - `twitter-openapi-typescript`: Twitter API クライアント
  - `@book000/node-utils`: 設定管理、Discord 通知、ロガー

## コーディング規約
- TypeScript の `skipLibCheck` を有効にして型チェックを回避しないこと。
- 関数やインターフェースには docstring (JSDoc) を日本語で記載すること。
- エラーメッセージは英語で記載すること。
- 既存のコードスタイル（ESLint, Prettier）に従うこと。

## 開発コマンド
```bash
# 依存関係のインストール
yarn install

# 実行
yarn start

# 開発（ウォッチモード）
yarn dev

# リンターの実行
yarn lint

# リンターによる自動修正
yarn fix

# ビルド（コンパイルとパッケージング）
yarn package
```

## テスト方針
- 現時点では自動テストは導入されていない。
- 新規機能追加時は、可能な限りモジュール化し、テストの書きやすさを考慮すること。

## セキュリティ / 機密情報
- `data/config.json` には Twitter の認証情報や Discord の Webhook URL が含まれるため、Git にコミットしないこと。
- ログに機密情報（パスワード、トークン、Cookie など）を出力しないこと。

## ドキュメント更新
- 機能変更や設定項目の追加時は `README.md` を更新すること。

## リポジトリ固有
- Twitter のスクレイピングには `cycletls` を使用しており、プロキシ設定（`PROXY_SERVER`, `PROXY_USERNAME`, `PROXY_PASSWORD`）を環境変数でサポートしている。
- 通知済みツイートは `data/notified.json` に保存される。

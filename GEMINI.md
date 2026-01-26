# Gemini CLI Instructions (GEMINI.md)

## 目的
このドキュメントは、Gemini CLI が本プロジェクトで作業する際のコンテキストと方針を定義したものです。

## 出力スタイル
- **言語**: 日本語
- **トーン**: プロフェッショナルかつ簡潔
- **形式**: GitHub Flavored Markdown

## 共通ルール
- 会話は日本語で行う。
- コミットメッセージは [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) に従い、説明文は日本語とする。
- 日本語と英数字の間には半角スペースを入れる。

## プロジェクト概要
- **目的**: Twitter アカウント「SameGauu」のツイートを監視し、Discord に通知する。
- **主な機能**: Twitter スクレイピング、Discord 通知、重複排除。

## コーディング規約
- **フォーマット**: Prettier / ESLint に従う。
- **命名規則**: キャメルケース（変数・関数）、パスカルケース（クラス・インターフェース）。
- **コメント**: 日本語で記載。
- **エラーメッセージ**: 英語で記載。

## 開発コマンド
```bash
# 依存関係のインストール
yarn install

# 実行
yarn start

# 開発
yarn dev

# リンター
yarn lint

# 自動修正
yarn fix
```

## 注意事項
- 認証情報のコミットは厳禁です。`.gitignore` を遵守してください。
- ログに機密情報を出力しないでください。
- 既存のコードベースの設計思想（シングルトンパターンの利用など）を優先してください。
- TypeScript の型定義を厳格に扱い、`any` の使用や型チェックの回避（`skipLibCheck`）は避けてください。

## リポジトリ固有
- Twitter の取得には `@the-convocation/twitter-scraper` と `cycletls` を組み合わせて使用しています。
- 環境変数によるプロキシ設定をサポートしています。

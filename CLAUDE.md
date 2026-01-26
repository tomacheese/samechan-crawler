# Claude Code Instructions (CLAUDE.md)

## 目的
このドキュメントは、Claude Code が本プロジェクトで作業する際の指針とプロジェクト固有のルールをまとめたものです。

## 判断記録のルール
1. 判断内容の要約を記載する
2. 検討した代替案を列挙する
3. 採用しなかった案とその理由を明記する
4. 前提条件・仮定・不確実性を明示する
5. 他エージェントによるレビュー可否を示す

前提・仮定・不確実性を明示し、仮定を事実のように扱わないこと。

## プロジェクト概要
- 目的: Twitter アカウント「SameGauu」のツイートを取得し、Discord に投稿する
- 主な機能: 指定した Twitter アカウントのツイートを定期的に取得、新しいツイートを Discord に通知、重複通知防止

## 重要ルール
- 会話は日本語で行う。
- PR とコミットは [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) に従う。
  - `<type>(<scope>): <description>` 形式で、`<description>` は日本語で記載する。
- コード内のコメントは日本語で記載する。
- エラーメッセージは英語で記載する。

## 環境のルール
- ブランチ命名は [Conventional Branch](https://conventional-branch.github.io) に従う。
  - `<type>/<description>` 形式（例: `feat/add-new-feature`, `fix/bug-fix`）。
  - `<type>` は短縮形（feat, fix, refactor, chore, docs, style, test）を使用する。
- GitHub リポジトリを調査のために参照する場合、テンポラリディレクトリに git clone して、そこでコード検索すること。
- Renovate が作成した既存のプルリクエストに対して、追加コミットや更新を行ってはならない。

## Git Worktree
- プロジェクトで Git Worktree を使用する場合、ディレクトリ構成は以下とする：
  - `.bare/`: bare リポジトリ
  - `<branch>`: 各ブランチの worktree

## コード改修時のルール
- 日本語と英数字の間には、半角スペースを挿入すること。
- エラーメッセージに絵文字を使用する場合は、全体で統一感を持たせること。
- TypeScript プロジェクトにおいて、`skipLibCheck` を有効にして型チェックを回避することは絶対にしてはならない。
- 関数やインターフェースには、docstring (JSDoc) を日本語で記載すること。

## 相談ルール
- 実装レビュー、局所設計、整合性確認については Codex CLI (Serena) に相談すること。
- 外部仕様、最新情報の確認については Gemini CLI に相談すること。
- 指摘を受けた場合は真摯に対応し、黙殺しないこと。

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

## アーキテクチャと主要ファイル
- **src/main.ts**: エントリーポイント。Twitter スクレイピングと Discord 通知のメインロジック。
- **src/config.ts**: 設定管理。`data/config.json` の読み込みとバリデーション。
- **src/notified.ts**: 通知済みツイートの管理。`data/notified.json` への保存と読み込み。

## 実装パターン
- `SamechanCrawlerConfiguration` クラス（`@book000/node-utils` の `ConfigFramework` を継承）を使用して設定を管理する。
- `Notified` クラスを使用して通知済みの管理を行う。

## テスト
- 現時点では自動テストは導入されていない。
- 新規追加時は `vitest` または `jest` の導入を検討すること。

## ドキュメント更新ルール
- 設定項目の追加・変更時は `README.md` の設定セクションを更新する。
- 依存関係の変更時は `package.json` を更新し、`yarn.lock` を確実に更新する。

## 作業チェックリスト

### 新規改修時
1. プロジェクトについて詳細に探索し理解すること。
2. 作業を行うブランチが適切であること。
3. 最新のリモートブランチに基づいた新規ブランチであること。
4. PR がクローズされ、不要となったブランチは削除されていること。
5. `yarn install` により依存パッケージをインストールしたこと。

### コミット・プッシュ前
1. コミットメッセージが Conventional Commits に従っていること。
2. コミット内容にセンシティブな情報が含まれていないこと。
3. Lint / Format エラーが発生しないこと（`yarn lint`）。
4. 動作確認を行い、期待通り動作すること。

### プルリクエストを作成前
1. プルリクエストの作成をユーザーから依頼されていること。
2. コミット内容にセンシティブな情報が含まれていないこと。
3. コンフリクトする恐れが無いこと。

### プルリクエストを作成後
1. コンフリクトが発生していないこと。
2. PR 本文が最新の状態のみを日本語で詳しく記載されていること。
3. GitHub Actions CI の結果を確認すること。
4. GitHub Copilot レビュー、Codex レビューへの対応を行うこと。

## リポジトリ固有
- `cycletls` を使用しており、HTTP リクエストの際に JA3 フィンガープリントを偽装している。
- プロキシ設定は環境変数から読み込まれる。

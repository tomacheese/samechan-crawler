# AGENTS.md

AI エージェント (Claude Code、GitHub Copilot など) 向けの共通ガイドです。

## 言語ルール

- 会話は日本語で行う。
- コミットの description、PR / Issue のタイトルと本文、レビューコメント、コード内のコメント・JSDoc、ドキュメントは日本語で記載する。
- 日本語と英数字の間には半角スペースを入れる。
- 段落の途中で手動改行しない。
- 次は日本語化の対象外とする: エラーメッセージ (英語)、`package.json` などの設定ファイル、技術的な識別子、引用、外部由来のテキスト、生成ファイル。
- Git の履歴は書き換えない。

## 概要

Twitter アカウント「SameGauu」(`TARGET_TWITTER_USERNAME` で変更可) のツイートを取得し、未通知のものを Discord に通知するクローラー。1 回の実行で取得と通知を行って終了し、Docker では `entrypoint.sh` が 10 分間隔で再実行する。TypeScript / Node.js (`.node-version` 参照) / pnpm。`cycletls` で JA3 フィンガープリントを設定して Twitter にアクセスする。設定項目と環境変数は `README.md` を参照。

## 開発コマンド

```bash
pnpm install   # 依存関係のインストール
pnpm start     # 実行
pnpm dev       # ウォッチモードで実行
pnpm lint      # prettier / eslint / tsc
pnpm fix       # prettier / eslint の自動修正
pnpm package   # clean + tsc + ncc によるパッケージング
```

自動テストは未導入。

## 構成

- `src/main.ts`: エントリーポイント。Cookie 取得 (キャッシュ / ログイン)、ツイート取得、Discord 通知。
- `src/config.ts`: `ConfigFramework` を継承した設定クラスとバリデーション。
- `src/notified.ts`: 通知済みツイート ID の保存と判定 (`data/notified.json`)。

## 規約

- コミットは [Conventional Commits](https://www.conventionalcommits.org/ja/v1.0.0/) に従う (`<type>(<scope>): <description>`、type は英語)。
- ブランチ名は [Conventional Branch](https://conventional-branch.github.io) の短縮形 (`feat/…`、`fix/…`、`docs/…` など)。
- 関数・クラス・インターフェースには日本語の JSDoc を記載する。
- `skipLibCheck` を有効にして型チェックを回避しない。
- 設定項目を追加・変更したら `README.md` を更新する。依存関係を変更したら `pnpm-lock.yaml` も更新する。
- Git Worktree を使用する場合、`.bare/` に bare リポジトリ、`<branch>` ディレクトリに各ブランチの worktree を置く。
- エラーメッセージに絵文字を使用する場合は、全体で統一感を持たせる。
- Renovate が作成した PR には追加コミットしない。
- 調査目的で他の GitHub リポジトリを参照するときは、一時ディレクトリに clone する。

## 注意事項

- `data/config.json` には Twitter の認証情報と Discord の Webhook URL / Bot Token が含まれる。`data/` は Git 管理外であり、コミットしない。
- ログにパスワード、トークン、Cookie を出力しない。
- `cycletls` による JA3 偽装とプロキシ設定 (`PROXY_SERVER`、`PROXY_USERNAME`、`PROXY_PASSWORD`) は意図的な仕様。

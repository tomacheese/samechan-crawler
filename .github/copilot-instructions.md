# GitHub Copilot 指示書

## プロジェクト概要

samechan-crawler は、Twitter をクロールして Discord に通知を送信する Node.js / TypeScript
アプリケーションです。

## 必須要件

### 言語要件

**すべてのコミュニケーションは日本語で行ってください。**

- Issue タイトル・本文: 日本語で記述
- PR タイトル・本文: 日本語で記述（Conventional Commits の仕様に従う）
- コミットメッセージ: 日本語で記述（Conventional Commits の仕様に従う）
- レビューコメント: 日本語で記述
- コード内コメント: 日本語で記述

### Conventional Commits 仕様

コミットメッセージと PR タイトルは以下の形式に従ってください：

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### type の種類

- `feat`: 新機能追加
- `fix`: バグ修正
- `docs`: ドキュメント変更
- `style`: コードフォーマット変更
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: その他の変更

#### 記述例

```text
feat(crawler): Twitter API v2 対応を追加

詳細な変更内容の説明をここに記述します。
複数行にわたって記述することも可能です。

Fixes #123
```

## プロジェクト構造

```text
.
├── .github/
│   └── workflows/          # GitHub Actions ワークフロー
├── src/
│   ├── main.ts            # メインエントリーポイント
│   ├── config.ts          # 設定管理
│   └── notified.ts        # 通知管理
├── package.json           # 依存関係とスクリプト
├── tsconfig.json         # TypeScript 設定
├── eslint.config.mjs     # ESLint 設定
├── .prettierrc.yml       # Prettier 設定
└── Dockerfile            # Docker 設定
```

## 開発環境

### 必要なツール

- Node.js（バージョンは `.node-version` ファイルを参照）
- Yarn パッケージマネージャー

### セットアップ

```bash
# 依存関係のインストール
yarn install

# 開発サーバーの起動
yarn dev

# ビルド
yarn compile

# リント実行
yarn lint

# フォーマット修正
yarn fix
```

## コーディング規約

### TypeScript

- 厳格な型チェックを使用
- `@book000/eslint-config` に従う
- 関数とクラスには適切な JSDoc コメントを日本語で記述

### コードスタイル

- Prettier による自動フォーマット
- ESLint による静的解析
- インデントは 2 スペース
- セミコロンは省略しない

### コメント

```typescript
/**
 * ユーザー情報を取得する関数
 * @param userId ユーザー ID
 * @returns ユーザー情報オブジェクト
 */
async function getUserInfo(userId: string): Promise<UserInfo> {
  // ここで API を呼び出してユーザー情報を取得
  const response = await api.getUser(userId)
  return response.data
}
```

## フォーマット規則

### 見出しと本文の間

すべての見出し（Heading）とその本文の間には、空白行を入れてください。

```markdown
## 見出し

本文はここに記述します。
```

### 英数字と日本語の間

英数字と日本語の間には、半角スペースを入れてください。

```markdown
❌ Node.jsプロジェクト
✅ Node.js プロジェクト

❌ v1.0.0リリース
✅ v1.0.0 リリース
```

## Git ワークフロー

### ブランチ戦略

- `master`: 本番環境用ブランチ
- `feature/*`: 機能開発用ブランチ
- `fix/*`: バグ修正用ブランチ
- `docs/*`: ドキュメント更新用ブランチ

### Pull Request

1. 機能ブランチから `master` ブランチへの PR を作成
2. PR タイトルは Conventional Commits 形式で日本語記述
3. 変更内容を詳細に日本語で説明
4. レビューを受けてからマージ

## CI/CD

### GitHub Actions

- `nodejs-ci.yml`: Node.js ビルド・テスト
- `docker.yml`: Docker イメージビルド

### 品質チェック

すべての PR で以下がチェックされます：

- TypeScript コンパイル
- ESLint 静的解析
- Prettier フォーマットチェック

## 外部ライブラリ

### 主要な依存関係

- `@book000/twitterts`: Twitter API クライアント
- `@book000/node-utils`: ユーティリティライブラリ
- `typescript`: TypeScript コンパイラ
- `eslint`: 静的解析ツール
- `prettier`: コードフォーマッター

### 新しい依存関係の追加

新しいライブラリを追加する際は：

1. 必要性を Issue で議論
2. セキュリティ面を考慮
3. ライセンスの互換性を確認
4. `yarn add` でインストール

## トラブルシューティング

### よくある問題

#### ビルドエラー

```bash
# 依存関係の再インストール
rm -rf node_modules yarn.lock
yarn install
```

#### リントエラー

```bash
# 自動修正可能なエラーを修正
yarn fix
```

#### TypeScript エラー

```bash
# 型チェック
yarn lint:tsc
```

## セキュリティ

### 設定ファイル

- 機密情報は `./data/config.json` に保存
- このファイルは `.gitignore` に含まれている
- 環境変数での設定も可能

### 依存関係

- 定期的に `yarn audit` でセキュリティチェック
- Renovate による自動更新

## ドキュメント

### コード内ドキュメント

- 複雑な処理には日本語コメントを追加
- 関数とクラスには JSDoc を記述
- TODO コメントは Issue として管理

### 外部ドキュメント

- 設定方法や使用方法は Issue や Discussion で管理

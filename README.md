# samechan-crawler

💭 Twitter アカウント「[SameGauu](https://twitter.com/SameGauu)」のツイートを取得し、Discord に投稿するクローラーです。

## 機能

- 指定した Twitter アカウントのツイートを定期的に取得
- 新しいツイートを Discord に通知
- 既に通知したツイートの重複通知を防止

## 必要要件

- Node.js （`.node-version` 参照）
- pnpm

## インストール

```bash
# リポジトリのクローン
git clone https://github.com/tomacheese/samechan-crawler.git
cd samechan-crawler

# 依存関係のインストール
pnpm install
```

## 設定

`data/config.json` を作成し、必要な設定を行います。

```json
{
  "twitter": {
    "username": "your-twitter-username",
    "password": "your-twitter-password",
    "otpSecret": "your-otp-secret",
    "emailAddress": "your-email-address"
  },
  "discord": {
    "webhookUrl": "https://discord.com/api/webhooks/..."
  }
}
```

`twitter.otpSecret` と `twitter.emailAddress` はオプションです。

または Bot Token を使用する場合:

```json
{
  "twitter": {
    "username": "your-twitter-username",
    "password": "your-twitter-password"
  },
  "discord": {
    "token": "your-bot-token",
    "channelId": "channel-id"
  }
}
```

## 使用方法

```bash
# 実行
pnpm start

# 開発モード（ファイル変更を監視）
pnpm dev
```

## Docker での実行

```bash
docker compose up -d
```

## ライセンス

このプロジェクトは [MIT](LICENSE) ライセンスの下で公開されています。

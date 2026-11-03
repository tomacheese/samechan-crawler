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

`twitter.otpSecret` と `twitter.emailAddress` は省略できます。`discord` には `webhookUrl`、または `token` と `channelId` の組のどちらかが必須です。Bot Token を使用する場合:

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

### 環境変数

すべて省略できます。

| 変数                               | 説明                                                               | 既定値                        |
| ---------------------------------- | ------------------------------------------------------------------ | ----------------------------- |
| `TARGET_TWITTER_USERNAME`          | 取得対象の Twitter ユーザー名                                      | `SameGauu`                    |
| `CONFIG_PATH`                      | 設定ファイルのパス                                                 | `./data/config.json`          |
| `NOTIFIED_PATH`                    | 通知済みツイート ID の保存先                                       | `./data/notified.json`        |
| `COOKIE_CACHE_PATH`                | ログイン Cookie のキャッシュ先 (有効期限 7 日)                     | `./data/twitter-cookies.json` |
| `LOG_DIR`                          | ログの出力先                                                       | `logs`                        |
| `PROXY_SERVER`                     | プロキシのホスト、または URL (`host:port` / `http(s)://host:port`) | なし                          |
| `PROXY_USERNAME`, `PROXY_PASSWORD` | プロキシの認証情報 (両方指定時のみ有効)                            | なし                          |

初回実行時は、取得したツイートを通知せずに通知済みとして保存します。

## 使用方法

```bash
# 実行
pnpm start

# 開発モード（ファイル変更を監視）
pnpm dev
```

1 回の実行でツイートを取得して通知し、終了します。

## Docker での実行

```bash
docker compose up -d
```

`./data` がコンテナの `/data` にマウントされます。`entrypoint.sh` が実行後 10 分待機して再実行を繰り返すため、定期実行されます。

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

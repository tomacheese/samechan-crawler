import fs from 'node:fs'
import path from 'node:path'
import { Scraper } from '@the-convocation/twitter-scraper'
import { cycleTLSExit } from '@the-convocation/twitter-scraper/cycletls'
import initCycleTLS, { CycleTLSClient } from 'cycletls'
import { Headers } from 'headers-polyfill'
import { TwitterOpenApi } from 'twitter-openapi-typescript'
import { Notified } from './notified'
import { SamechanCrawlerConfiguration } from './config'
import { Discord, Logger } from '@book000/node-utils'

// --- CycleTLS インスタンス管理 ---
// Promise ベースのシングルトンパターンで並行初期化を防止
let cycleTLSInstancePromise: Promise<CycleTLSClient> | null = null

async function initCycleTLSWithProxy(): Promise<CycleTLSClient> {
  cycleTLSInstancePromise ??= initCycleTLS()
  return cycleTLSInstancePromise
}

// --- カスタム fetch 関数 ---
/**
 * Headers ライクなオブジェクトのインターフェース
 * undici の _Headers クラスや標準の Headers クラスに対応
 */
interface HeadersLike {
  entries?: () => IterableIterator<[string, string]>
  [Symbol.iterator]?: () => Iterator<[string, string]>
}

/**
 * プロキシサポート付きの CycleTLS fetch 関数
 */
async function cycleTLSFetchWithProxy(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const instance = await initCycleTLSWithProxy()
  const url =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url

  const method = (init?.method ?? 'GET').toUpperCase()

  // ヘッダーを抽出（_Headers クラス対応）
  const headers: Record<string, string> = {}
  if (init?.headers) {
    const h = init.headers as HeadersLike
    if (h.entries && typeof h.entries === 'function') {
      // entries() メソッドを使用（_Headers クラス対応）
      for (const [key, value] of h.entries()) {
        headers[key] = value
      }
    } else if (Array.isArray(init.headers)) {
      // 配列形式
      for (const [key, value] of init.headers) {
        headers[key] = value
      }
    } else if (h[Symbol.iterator] && typeof h[Symbol.iterator] === 'function') {
      // イテラブル
      for (const [key, value] of init.headers as unknown as Iterable<
        [string, string]
      >) {
        headers[key] = value
      }
    } else {
      // プレーンオブジェクト
      Object.assign(headers, init.headers as Record<string, string>)
    }
  }

  // ボディの処理
  let body: string | undefined
  if (init?.body) {
    if (typeof init.body === 'string') {
      body = init.body
    } else if (init.body instanceof URLSearchParams) {
      body = init.body.toString()
    } else {
      body = JSON.stringify(init.body)
    }
  }

  // プロキシ設定を構築
  let proxy: string | undefined
  const proxyServer = process.env.PROXY_SERVER
  if (proxyServer) {
    // プロトコルがない場合は http:// を追加
    const normalizedProxyServer =
      proxyServer.startsWith('http://') || proxyServer.startsWith('https://')
        ? proxyServer
        : `http://${proxyServer}`

    const proxyUsername = process.env.PROXY_USERNAME
    const proxyPassword = process.env.PROXY_PASSWORD
    if (proxyUsername && proxyPassword) {
      try {
        const proxyUrl = new URL(normalizedProxyServer)
        proxyUrl.username = proxyUsername
        proxyUrl.password = proxyPassword
        proxy = proxyUrl.toString()
      } catch {
        throw new Error(
          `Invalid PROXY_SERVER URL: ${proxyServer}. Expected format: host:port, http://host:port or https://host:port`
        )
      }
    } else {
      proxy = normalizedProxyServer
    }
  }

  // CycleTLS オプションを構築
  const options: Record<string, unknown> = {
    body,
    headers,
    // JA3 フィンガープリント: Chrome 120 on Windows 10
    ja3: '771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-17513,29-23-24,0',
    // UserAgent: Chrome 135
    userAgent:
      headers['user-agent'] ||
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
  }
  if (proxy) {
    options.proxy = proxy
  }

  const response = await instance(
    url,
    options,
    method.toLowerCase() as
      | 'head'
      | 'get'
      | 'post'
      | 'put'
      | 'delete'
      | 'trace'
      | 'options'
      | 'connect'
      | 'patch'
  )

  // レスポンスヘッダーを構築
  const responseHeaders = new Headers()
  for (const [key, value] of Object.entries(response.headers)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        responseHeaders.append(key, v)
      }
    } else if (typeof value === 'string') {
      responseHeaders.set(key, value)
    }
  }

  // レスポンスボディを取得
  let responseBody: string
  if (response.data !== undefined && response.data !== null) {
    responseBody =
      typeof response.data === 'string'
        ? response.data
        : JSON.stringify(response.data)
  } else {
    responseBody = ''
  }

  return new Response(responseBody, {
    status: response.status,
    statusText: '',
    headers: responseHeaders,
  })
}

// --- Cookie キャッシュ機能 ---
const COOKIE_CACHE_FILE =
  process.env.COOKIE_CACHE_PATH ?? './data/twitter-cookies.json'
const COOKIE_EXPIRY_DAYS = 7

interface CachedCookies {
  auth_token: string
  ct0: string
  savedAt: number
}

function isValidCachedCookies(data: unknown): data is CachedCookies {
  if (typeof data !== 'object' || data === null) {
    return false
  }
  const obj = data as Record<string, unknown>
  return (
    typeof obj.auth_token === 'string' &&
    typeof obj.ct0 === 'string' &&
    typeof obj.savedAt === 'number'
  )
}

function loadCachedCookies(): CachedCookies | null {
  try {
    if (!fs.existsSync(COOKIE_CACHE_FILE)) {
      return null
    }
    const data: unknown = JSON.parse(fs.readFileSync(COOKIE_CACHE_FILE, 'utf8'))
    if (!isValidCachedCookies(data)) {
      console.warn('⚠️ Cookie キャッシュの構造が不正です')
      return null
    }
    const expiryMs = COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    if (Date.now() - data.savedAt > expiryMs) {
      console.info('ℹ️ Cookie キャッシュの有効期限が切れています')
      return null
    }
    return data
  } catch (error) {
    console.warn('⚠️ キャッシュされた Cookie の読み込みに失敗しました', error)
    return null
  }
}

function saveCookies(authToken: string, ct0: string): void {
  const dir = path.dirname(COOKIE_CACHE_FILE)
  if (dir && dir !== '.' && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  const data: CachedCookies = {
    auth_token: authToken,
    ct0,
    savedAt: Date.now(),
  }
  fs.writeFileSync(COOKIE_CACHE_FILE, JSON.stringify(data, null, 2))
}

// --- リトライ機能 ---
async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    baseDelayMs?: number
    maxDelayMs?: number
    operationName?: string
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 30_000,
    operationName = 'operation',
  } = options

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: unknown) {
      const isLastAttempt = attempt >= maxRetries

      if (isLastAttempt) {
        throw error
      }

      const delay = Math.min(baseDelayMs * Math.pow(2, attempt - 1), maxDelayMs)
      console.warn(
        `⚠️ ${operationName} に失敗しました (${attempt}/${maxRetries} 回目)、${delay / 1000} 秒後にリトライします...`
      )
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new Error(
    `${operationName} が ${maxRetries} 回のリトライ後に失敗しました`
  )
}

// --- ログイン処理（503 エラー対策） ---
async function loginWithRetry(
  scraper: Scraper,
  username: string,
  password: string,
  email?: string,
  twoFactorSecret?: string,
  maxRetries = 5
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔐 ログイン試行中 (${attempt}/${maxRetries} 回目)...`)
      await scraper.login(username, password, email, twoFactorSecret)
      return
    } catch (error: unknown) {
      const is503 =
        error instanceof Error &&
        (error.message.includes('503') ||
          error.message.includes('Service Unavailable'))

      if (is503 && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30_000)
        console.warn(`⚠️ 503 エラー、${delay / 1000} 秒後にリトライします...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else {
        throw error
      }
    }
  }
}

// --- 認証 Cookie の取得 ---
async function getAuthCookies(
  config: SamechanCrawlerConfiguration
): Promise<{ authToken: string; ct0: string }> {
  // キャッシュされた Cookie があれば使用
  const cached = loadCachedCookies()
  if (cached) {
    console.log('📦 キャッシュされた Cookie を使用します')
    return { authToken: cached.auth_token, ct0: cached.ct0 }
  }

  // 設定から認証情報を取得
  const twitterConfig = config.get('twitter')
  const username = twitterConfig.username
  const password = twitterConfig.password
  if (!username || !password) {
    throw new Error('Twitter username or password is not set in config')
  }

  console.log('🔐 twitter-scraper + CycleTLS でログイン中...')
  // カスタム fetch 関数を使用（プロキシサポート付き）
  const scraper = new Scraper({
    fetch: cycleTLSFetchWithProxy,
  })

  await loginWithRetry(
    scraper,
    username,
    password,
    twitterConfig.emailAddress,
    twitterConfig.otpSecret
  )

  if (!(await scraper.isLoggedIn())) {
    throw new Error('ログインに失敗しました')
  }

  // Cookie を取得
  const cookies = await scraper.getCookies()
  const authToken = cookies.find((c) => c.key === 'auth_token')?.value
  const ct0 = cookies.find((c) => c.key === 'ct0')?.value

  if (!authToken || !ct0) {
    throw new Error('Cookie から auth_token または ct0 を取得できませんでした')
  }

  // Cookie をキャッシュに保存
  saveCookies(authToken, ct0)
  console.log('✅ ログイン成功、Cookie を保存しました')

  return { authToken, ct0 }
}

// --- メイン処理 ---
async function main() {
  const logger = Logger.configure('main')
  logger.info('✨ main()')

  const config = new SamechanCrawlerConfiguration('./data/config.json')
  config.load()
  if (!config.validate()) {
    logger.error('❌ Config is invalid')
    for (const failure of config.getValidateFailures()) {
      logger.error('- ' + failure)
    }
    return
  }

  // Twitter API クライアントを初期化
  const { authToken, ct0 } = await getAuthCookies(config)

  const api = new TwitterOpenApi()
  const client = await api.getClientFromCookies({
    auth_token: authToken,
    ct0,
  })

  try {
    const discordConfig = config.get('discord')
    const discord = discordConfig.webhookUrl
      ? new Discord({
          webhookUrl: discordConfig.webhookUrl,
        })
      : discordConfig.token && discordConfig.channelId
        ? new Discord({
            token: discordConfig.token,
            channelId: discordConfig.channelId,
          })
        : null
    if (discord === null) {
      throw new Error('Discord config is invalid')
    }

    const targetScreenName = process.env.TARGET_TWITTER_USERNAME ?? 'SameGauu'

    logger.info('🔍 Fetching user info...')
    // ユーザー情報取得
    const userResponse = await withRetry(
      () =>
        client
          .getUserApi()
          .getUserByScreenName({ screenName: targetScreenName }),
      {
        maxRetries: 3,
        baseDelayMs: 2000,
        operationName: 'ユーザー情報取得',
      }
    )

    // ⚠️ 重要: userData.data ではなく userData.user を使用
    const userData = userResponse.data.user
    if (!userData) {
      throw new Error('ユーザーデータの取得に失敗しました')
    }
    const userId = userData.restId

    logger.info('🔍 Fetching tweets...')
    // ユーザーのツイート取得
    const tweetsResponse = await withRetry(
      () =>
        client.getTweetApi().getUserTweets({
          userId,
          count: 200,
        }),
      {
        maxRetries: 3,
        baseDelayMs: 2000,
        operationName: 'ユーザーツイート取得',
      }
    )

    // 結果の処理
    const tweets = tweetsResponse.data.data
    logger.info(`🔍 Fetched ${tweets.length} tweets`)

    const notified = new Notified(
      process.env.NOTIFIED_PATH ?? './data/notified.json'
    )
    const initializeMode = notified.isFirst()
    if (initializeMode) {
      logger.info('💾 Initialize mode. Save all tweets to file')
      for (const tweetResult of tweets) {
        const tweet = tweetResult.tweet
        const idStr = tweet.legacy?.idStr ?? tweet.restId
        if (idStr) {
          notified.add(idStr)
        }
      }
      return
    }

    const notifyTweets = tweets.filter((tweetResult) => {
      const tweet = tweetResult.tweet
      const idStr = tweet.legacy?.idStr ?? tweet.restId
      const fullText = tweet.legacy?.fullText ?? ''
      return idStr && !notified.isNotified(idStr) && fullText
    })
    logger.info(`🔔 Notify ${notifyTweets.length} tweets`)

    for (const tweetResult of notifyTweets.toReversed()) {
      const tweet = tweetResult.tweet
      const user = tweetResult.user
      const legacy = tweet.legacy

      const fullText = legacy?.fullText ?? ''
      const screenName = user.legacy.screenName
      const userName = user.legacy.name
      const createdAt = legacy?.createdAt ?? ''
      const idStr = legacy?.idStr ?? tweet.restId

      if (!idStr) {
        continue
      }

      logger.info(`✅ New tweet: ${idStr}`)

      // メディア URL の取得
      let imageUrl: string | undefined
      const extendedEntities = legacy?.extendedEntities
      if (extendedEntities?.media && extendedEntities.media.length > 0) {
        imageUrl = extendedEntities.media[0]?.mediaUrlHttps ?? undefined
      }

      // プロフィール画像 URL
      const profileImageUrl = user.legacy.profileImageUrlHttps

      logger.info('📤 Sending to Discord...')
      await discord.sendMessage({
        embeds: [
          {
            description: fullText,
            author: {
              name: userName,
              url: `https://twitter.com/${screenName}`,
              icon_url: profileImageUrl,
            },
            image: imageUrl ? { url: imageUrl } : undefined,
            footer: {
              text: 'Twitter',
              icon_url:
                'https://abs.twimg.com/icons/apple-touch-icon-192x192.png',
            },
            timestamp: createdAt
              ? new Date(createdAt).toISOString()
              : undefined,
            color: 0x1d_a1_f2,
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 5,
                emoji: {
                  name: '🔗',
                },
                url: `https://twitter.com/${screenName}/status/${idStr}`,
              },
              {
                type: 2,
                style: 5,
                emoji: {
                  name: '🔁',
                },
                url: `https://twitter.com/intent/retweet?tweet_id=${idStr}`,
              },
              {
                type: 2,
                style: 5,
                emoji: {
                  name: '❤️',
                },
                url: `https://twitter.com/intent/like?tweet_id=${idStr}`,
              },
            ],
          },
        ],
      })
      notified.add(idStr)

      // wait 1 second (Discord API rate limit)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  } catch (error) {
    logger.error("❌ Error: Couldn't fetch tweets", error as Error)
  }
}

// --- クリーンアップ処理 ---
async function cleanup(): Promise<void> {
  const logger = Logger.configure('cleanup')
  // CycleTLS インスタンスのクリーンアップ（初期化されている場合のみ）
  if (cycleTLSInstancePromise) {
    try {
      const instance = await cycleTLSInstancePromise
      await instance.exit()
    } catch (error) {
      // インスタンスの終了に失敗しても致命的ではないため、警告ログのみ出力する
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred'
      logger.warn(`CycleTLS インスタンスの終了に失敗しました: ${message}`)
    }
  }
  // twitter-scraper の内部 CycleTLS インスタンスも終了
  try {
    cycleTLSExit()
  } catch (error) {
    // 初期化されていない可能性が高いため、デバッグログとして記録する
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred'
    logger.debug(
      `twitter-scraper の内部 CycleTLS インスタンス終了処理でエラーが発生しました（未初期化の可能性）: ${message}`
    )
  }
}

// --- エントリーポイント ---
;(async () => {
  let exitCode = 0
  try {
    await main()
  } catch (error) {
    Logger.configure('main').error('❌ Fatal error occurred', error as Error)
    exitCode = 1
  } finally {
    await cleanup()
  }

  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(exitCode)
})()

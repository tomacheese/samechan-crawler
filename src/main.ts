import { Twitter } from '@book000/twitterts'
import { Notified } from './notified'
import { SamechanCrawlerConfiguration } from './config'
import { Discord, Logger } from '@book000/node-utils'
import { FullUser } from 'twitter-d'

function isFullUser(user: any): user is FullUser {
  return user.id_str !== undefined
}

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

  const twitter = await Twitter.login({
    username: config.get('twitter').username,
    password: config.get('twitter').password,
    otpSecret: config.get('twitter').otpSecret,
    puppeteerOptions: {
      executablePath: process.env.CHROMIUM_PATH,
      userDataDirectory: process.env.USER_DATA_DIRECTORY || './data/userdata',
    },
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

    logger.info('🔍 Fetching tweets...')
    const tweets = await twitter.getUserTweets({
      screenName: 'SameGauu',
    })
    logger.info(`🔍 Fetched ${tweets.length} tweets`)

    const notified = new Notified(
      process.env.NOTIFIED_PATH || './data/notified.json'
    )
    const isFirst = notified.isFirst()
    logger.info(`📝 isFirst: ${isFirst}`)

    for (const tweet of tweets.reverse()) {
      if (notified.isNotified(tweet.id)) {
        logger.info(`⏭️ Already notified: ${tweet.id}`)
        continue
      }

      if (!isFullUser(tweet.user)) {
        continue
      }

      notified.add(tweet.id)

      logger.info(`✅ New tweet: ${tweet.id}`)
      if (isFirst) {
        continue
      }

      logger.info('📤 Sending to Discord...')
      await discord.sendMessage({
        embeds: [
          {
            description: tweet.full_text,
            author: {
              name: tweet.user.name,
              url: `https://twitter.com/${tweet.user.screen_name}`,
              icon_url: tweet.user.profile_image_url_https,
            },
            footer: {
              text: 'Twitter',
              icon_url:
                'https://abs.twimg.com/icons/apple-touch-icon-192x192.png',
            },
            timestamp: new Date(tweet.created_at).toISOString(),
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
                url: `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`,
              },
              {
                type: 2,
                style: 5,
                emoji: {
                  name: '🔁',
                },
                url: `https://twitter.com/intent/retweet?tweet_id=${tweet.id_str}`,
              },
              {
                type: 2,
                style: 5,
                emoji: {
                  name: '❤️',
                },
                url: `https://twitter.com/intent/like?tweet_id=${tweet.id_str}`,
              },
            ],
          },
        ],
      })
    }
  } catch (error) {
    logger.error("Error: Couldn't fetch tweets", error as Error)
  }
  logger.info('🚀 Closing browser...')
  await twitter.close()
}

;(async () => {
  await main()
})()

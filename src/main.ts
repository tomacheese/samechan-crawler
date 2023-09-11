import { Twitter } from '@book000/twitterts'
import { Notified } from './notified'
import { SamechanCrawlerConfiguration } from './config'
import { Discord } from '@book000/node-utils'
import { FullUser } from 'twitter-d'

function isFullUser(user: any): user is FullUser {
  return user.id_str !== undefined
}

async function main() {
  const config = new SamechanCrawlerConfiguration('./data/config.json')
  config.load()

  const twitter = await Twitter.login({
    username: config.get('twitter').username,
    password: config.get('twitter').password,
    otpSecret: config.get('twitter').otpSecret,
    puppeteerOptions: {
      executablePath: process.env.CHROMIUM_PATH,
      userDataDirectory: process.env.USER_DATA_DIRECTORY || './data/userdata',
    },
  })
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

  const tweets = await twitter.getUserTweets({
    screenName: 'SameGauu',
  })

  const notified = new Notified(
    process.env.NOTIFIED_PATH || './data/notified.json'
  )
  const isFirst = notified.isFirst()

  for (const tweet of tweets) {
    if (notified.isNotified(tweet.id)) {
      continue
    }

    if (!isFullUser(tweet.user)) {
      continue
    }

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
    })

    if (isFirst) {
      continue
    }
    notified.add(tweet.id)
  }

  await twitter.close()
}

;(async () => {
  await main()
})()

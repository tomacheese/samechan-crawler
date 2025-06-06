import { ConfigFramework } from '@book000/node-utils'

interface Config {
  twitter: {
    username: string
    password: string
    otpSecret?: string
    emailAddress?: string
  }
  discord: {
    webhookUrl?: string
    token?: string
    channelId?: string
  }
}

export class SamechanCrawlerConfiguration extends ConfigFramework<Config> {
  protected validates(): Record<string, (config: Config) => boolean> {
    return {
      'twitter is required': (config) => !!config.twitter,
      'twitter is object': (config) => typeof config.twitter === 'object',
      'twitter.username is required': (config) => !!config.twitter.username,
      'twitter.username is string': (config) =>
        typeof config.twitter.username === 'string',
      'twitter.password is required': (config) => !!config.twitter.password,
      'twitter.password is string': (config) =>
        typeof config.twitter.password === 'string',
      'discord is required': (config) => !!config.discord,
      'discord is object': (config) => typeof config.discord === 'object',
      'discord.webhookUrl is string or undefined': (config) =>
        typeof config.discord.webhookUrl === 'string' ||
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        config.discord.webhookUrl === undefined,
      'discord.token is string or undefined': (config) =>
        typeof config.discord.token === 'string' ||
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        config.discord.token === undefined,
      'discord.channelId is string or undefined': (config) =>
        typeof config.discord.channelId === 'string' ||
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        config.discord.channelId === undefined,
    }
  }
}

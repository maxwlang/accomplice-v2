import Accomplice from '../src/accomplice'
import { ChannelType } from 'discord.js'

describe('Accomplice.findPublicChannel', () => {
  it('locates the first text channel where the bot can send messages', () => {
    const channel = {
      type: ChannelType.GuildText,
      members: new Map([
        ['bot', { permissions: { has: jest.fn().mockReturnValue(true) } }]
      ])
    } as any
    const guild = { channels: { cache: { find: () => channel } }, name: 'G' } as any
    const bot = {
      guilds: { cache: new Map([['g1', guild]]) },
      user: { id: 'bot' },
      logger: { error: jest.fn() }
    } as any
    const found = Accomplice.prototype.findPublicChannel.call(bot, 'g1')
    expect(found).toBe(channel)
  })

  it('returns undefined and logs when guild missing', () => {
    const bot = {
      guilds: { cache: new Map() },
      user: { id: 'bot' },
      logger: { error: jest.fn() }
    } as any
    const result = Accomplice.prototype.findPublicChannel.call(bot, 'missing')
    expect(result).toBeUndefined()
    expect(bot.logger.error).toHaveBeenCalled()
  })
})

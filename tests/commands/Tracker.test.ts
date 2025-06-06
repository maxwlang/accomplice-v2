import TrackerCommand from '../../src/commands/Tracker'
import { ReactionType } from '../../src/sequelize/types/reaction'
import { normalizeEmoji } from '../../src/util/emoji'

describe('Tracker command', () => {
  it('handles unknown subcommand', async () => {
    const reply = jest.fn()
    const interaction = { options: { getSubcommand: () => 'bad' }, reply } as any
    const cmd = new TrackerCommand()
    await cmd.execute({ bot: {} as any, interaction })
    const embed = reply.mock.calls[0][0].embeds[0]
    expect(embed.data.title).toBe('Error')
  })

  it('creates tracker with emoji reaction', async () => {
    const cmd = new TrackerCommand()
    const reply = jest.fn()
    const getSubcommand = jest.fn(() => 'create')
    const getString = jest.fn((name: string) =>
      name === 'reaction' ? '⭐' : name === 'name' ? 'Stars' : null
    )
    const interaction = {
      guildId: '1',
      options: {
        getSubcommand,
        getString,
        getInteger: () => null,
        getBoolean: () => null
      },
      reply
    } as any
    const findOrCreate = jest.fn().mockResolvedValue([{ uuid: 't1' }, true])
    const bot = {
      emojis: { cache: new Map() },
      sequelize: {
        models: {
          Guild: { findOne: jest.fn().mockResolvedValue({ uuid: 'g1' }) },
          Tracker: { findOrCreate }
        }
      }
    } as any
    await cmd.execute({ bot, interaction })
    expect(findOrCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          reactionType: ReactionType.Emoji,
          reactionContent: normalizeEmoji('⭐')
        })
      })
    )
    expect(reply).toHaveBeenCalled()
  })

  it('creates tracker with custom emote reaction', async () => {
    const cmd = new TrackerCommand()
    const reply = jest.fn()
    const getSubcommand = jest.fn(() => 'create')
    const getString = jest.fn((name: string) =>
      name === 'reaction' ? '<:star:1234>' : name === 'name' ? 'Stars' : null
    )
    const interaction = {
      guildId: '1',
      options: {
        getSubcommand,
        getString,
        getInteger: () => null,
        getBoolean: () => null
      },
      reply
    } as any
    const findOrCreate = jest.fn().mockResolvedValue([{ uuid: 't1' }, true])
    const bot = {
      emojis: { cache: new Map([['1234', { id: '1234', animated: false }]]) },
      sequelize: {
        models: {
          Guild: { findOne: jest.fn().mockResolvedValue({ uuid: 'g1' }) },
          Tracker: { findOrCreate }
        }
      }
    } as any
    await cmd.execute({ bot, interaction })
    expect(findOrCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          reactionType: ReactionType.Custom,
          reactionContent: '1234'
        })
      })
    )
    expect(reply).toHaveBeenCalled()
  })

  it('fails to create tracker with invalid emoji', async () => {
    const cmd = new TrackerCommand()
    const reply = jest.fn()
    const getSubcommand = jest.fn(() => 'create')
    const getString = jest.fn((name: string) =>
      name === 'reaction' ? 'not-an-emoji' : name === 'name' ? 'Bad' : null
    )
    const interaction = {
      guildId: '1',
      options: {
        getSubcommand,
        getString,
        getInteger: () => null,
        getBoolean: () => null
      },
      reply
    } as any
    const bot = {
      emojis: { cache: new Map() },
      sequelize: {
        models: {
          Guild: { findOne: jest.fn().mockResolvedValue({ uuid: 'g1' }) },
          Tracker: { findOrCreate: jest.fn() }
        }
      },
      logger: { error: jest.fn() }
    } as any
    await cmd.execute({ bot, interaction })
    const embed = reply.mock.calls[0][0].embeds[0]
    expect(embed.data.title).toBe('Error')
  })

  it('fails when guild lookup fails', async () => {
    const cmd = new TrackerCommand()
    const reply = jest.fn()
    const getSubcommand = jest.fn(() => 'create')
    const getString = jest.fn((name: string) =>
      name === 'reaction' ? '⭐' : name === 'name' ? 'Stars' : null
    )
    const interaction = {
      guildId: '1',
      options: {
        getSubcommand,
        getString,
        getInteger: () => null,
        getBoolean: () => null
      },
      reply
    } as any
    const bot = {
      emojis: { cache: new Map() },
      sequelize: { models: { Guild: { findOne: jest.fn().mockResolvedValue(null) } } },
      logger: { error: jest.fn() }
    } as any
    await cmd.execute({ bot, interaction })
    const embed = reply.mock.calls[0][0].embeds[0]
    expect(embed.data.title).toBe('Error')
  })

  it('destroys tracker and updates leaderboards', async () => {
    const cmd = new TrackerCommand()
    const reply = jest.fn()
    const getSubcommand = jest.fn(() => 'destroy')
    const getBoolean = jest.fn(() => true)
    const getString = jest.fn(() => 't1')
    const interaction = {
      guildId: '1',
      options: { getSubcommand, getBoolean, getString },
      reply
    } as any
    const Tracker = {
      findOne: jest.fn().mockResolvedValue({ uuid: 't1' }),
      destroy: jest.fn()
    }
    const LeaderboardTrackers = {
      findAll: jest.fn().mockResolvedValue([{ uuid: 'lt1', leaderboardId: 'lb1' }]),
      destroy: jest.fn()
    }
    const Leaderboard = { update: jest.fn() }
    const bot = {
      createOrUpdateLeaderboardEmbed: jest.fn(),
      sequelize: {
        models: {
          Guild: { findOne: jest.fn().mockResolvedValue({ uuid: 'g1' }) },
          Tracker,
          LeaderboardTrackers,
          Leaderboard
        }
      }
    } as any
    await cmd.execute({ bot, interaction })
    expect(Tracker.destroy).toHaveBeenCalledWith({ where: { uuid: 't1' } })
    expect(LeaderboardTrackers.destroy).toHaveBeenCalledWith({ where: { trackerId: 't1' } })
    expect(Leaderboard.update).toHaveBeenCalledWith(
      { defaultLeaderboardTrackerId: null,
        where: { defaultLeaderboardTrackerId: 'lt1' } }
    )
    expect(bot.createOrUpdateLeaderboardEmbed).toHaveBeenCalledWith('lb1')
    expect(reply).toHaveBeenCalled()
  })

  it('lists trackers for a guild', async () => {
    const cmd = new TrackerCommand()
    const reply = jest.fn()
    const getSubcommand = jest.fn(() => 'list')
    const interaction = {
      guildId: '1',
      options: { getSubcommand },
      reply
    } as any
    const trackers = [
      {
        uuid: 't1',
        guildId: 'g1',
        name: 'star',
        imageUrl: null,
        length: 5,
        reactionType: ReactionType.Emoji,
        displayBots: false,
        displayMissingUsers: false,
        reactionContent: normalizeEmoji('⭐'),
        recognizeSelfReactions: false,
        recognizeBotReactions: false
      }
    ]
    const bot = {
      sequelize: {
        models: {
          Guild: { findOne: jest.fn().mockResolvedValue({ uuid: 'g1' }) },
          Tracker: { findAll: jest.fn().mockResolvedValue(trackers) }
        }
      }
    } as any
    await cmd.execute({ bot, interaction })
    const embed = reply.mock.calls[0][0].embeds[0]
    expect(embed.data.title).toBe('Trackers')
    expect(reply).toHaveBeenCalled()
  })
})

import ReactionAdded from '../../src/events/ReactionAdded'
import { ReactionType } from '../../src/sequelize/types/reaction'

jest.mock('../../src/util/emoji', () => ({
    getEmojiType: () => ReactionType.Emoji,
    normalizeEmoji: (e: string) => `norm:${e}`
}))

describe('ReactionAdded event', () => {
    it('logs reaction and updates leaderboards', async () => {
        const messageReaction = {
            partial: false,
            emoji: { name: '😀', id: null, animated: false },
            message: {
                author: { id: 'u1', bot: false },
                id: 'm1',
                guildId: 'g1'
            }
        } as any
        const reactor = { id: 'u2', bot: false } as any
        const Guild = {
            findOrCreate: jest.fn().mockResolvedValue([{ uuid: 'gid' }, false])
        }
        const User = {
            findOrCreate: jest.fn().mockResolvedValue([{ uuid: 'uid' }, false])
        }
        const GuildUser = { create: jest.fn() }
        const Reaction = { create: jest.fn().mockResolvedValue({ uuid: 'r1' }) }
        const bot = {
            user: { id: 'bot' },
            sequelize: { models: { Guild, User, GuildUser, Reaction } },
            logger: { debug: jest.fn(), error: jest.fn() },
            locateLeaderboardsForReaction: jest.fn().mockResolvedValue(['lb']),
            createOrUpdateLeaderboardEmbed: jest.fn()
        } as any
        const event = new ReactionAdded()
        await event.execute({ args: [messageReaction, reactor], bot })
        expect(Reaction.create).toHaveBeenCalled()
        expect(bot.createOrUpdateLeaderboardEmbed).toHaveBeenCalledWith('lb')
    })

    it('returns early when fetching a partial reaction fails', async () => {
        const messageReaction = {
            partial: true,
            fetch: jest.fn().mockRejectedValue(new Error('fail')),
            emoji: { name: '😀', id: null, animated: false },
            message: {}
        } as any
        const reactor = { id: 'u2', bot: false } as any
        const Guild = {
            findOrCreate: jest.fn()
        }
        const User = {
            findOrCreate: jest.fn()
        }
        const GuildUser = { create: jest.fn() }
        const Reaction = { create: jest.fn() }
        const bot = {
            user: { id: 'bot' },
            sequelize: { models: { Guild, User, GuildUser, Reaction } },
            logger: { debug: jest.fn(), error: jest.fn() },
            locateLeaderboardsForReaction: jest.fn(),
            createOrUpdateLeaderboardEmbed: jest.fn()
        } as any
        const event = new ReactionAdded()
        await event.execute({ args: [messageReaction, reactor], bot })
        expect(messageReaction.fetch).toHaveBeenCalled()
        expect(bot.logger.error).toHaveBeenCalled()
        expect(Reaction.create).not.toHaveBeenCalled()
    })

    it('logs and returns when message author is missing', async () => {
        const messageReaction = {
            partial: false,
            emoji: { name: '😀', id: null, animated: false },
            message: {
                author: null,
                id: 'm1',
                guildId: 'g1'
            }
        } as any
        const reactor = { id: 'u2', bot: false } as any
        const Guild = {
            findOrCreate: jest.fn()
        }
        const User = {
            findOrCreate: jest.fn()
        }
        const GuildUser = { create: jest.fn() }
        const Reaction = { create: jest.fn() }
        const bot = {
            user: { id: 'bot' },
            sequelize: { models: { Guild, User, GuildUser, Reaction } },
            logger: { debug: jest.fn(), error: jest.fn() },
            locateLeaderboardsForReaction: jest.fn(),
            createOrUpdateLeaderboardEmbed: jest.fn()
        } as any
        const event = new ReactionAdded()
        await event.execute({ args: [messageReaction, reactor], bot })
        expect(bot.logger.error).toHaveBeenCalledWith(
            'Failed to log reaction, could not identify message author'
        )
        expect(Reaction.create).not.toHaveBeenCalled()
    })

    it('returns when guild lookup fails', async () => {
        const messageReaction = {
            partial: false,
            emoji: { name: '😀', id: null, animated: false },
            message: {
                author: { id: 'u1', bot: false },
                id: 'm1',
                guildId: null
            }
        } as any
        const reactor = { id: 'u2', bot: false } as any
        const Guild = {
            findOrCreate: jest.fn().mockResolvedValue([{ uuid: 'gid' }, false])
        }
        const User = {
            findOrCreate: jest.fn().mockResolvedValue([{ uuid: 'uid' }, false])
        }
        const GuildUser = { create: jest.fn() }
        const Reaction = { create: jest.fn() }
        const bot = {
            user: { id: 'bot' },
            sequelize: { models: { Guild, User, GuildUser, Reaction } },
            logger: { debug: jest.fn(), error: jest.fn() },
            locateLeaderboardsForReaction: jest.fn(),
            createOrUpdateLeaderboardEmbed: jest.fn()
        } as any
        const event = new ReactionAdded()
        await event.execute({ args: [messageReaction, reactor], bot })
        expect(bot.logger.error).toHaveBeenCalledWith(
            'Failed to log reaction, could not locate guild'
        )
        expect(Reaction.create).not.toHaveBeenCalled()
    })
})

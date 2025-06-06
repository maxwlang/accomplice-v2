import ReactionRemoved from '../../src/events/ReactionRemoved'
import { ReactionType } from '../../src/sequelize/types/reaction'

jest.mock('../../src/util/emoji', () => ({
    getEmojiType: () => ReactionType.Emoji,
    normalizeEmoji: (e: string) => `norm:${e}`
}))

describe('ReactionRemoved event', () => {
    it('removes reaction and updates leaderboards', async () => {
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
        const Reaction = {
            findOne: jest.fn().mockResolvedValue({ uuid: 'r1' }),
            destroy: jest.fn()
        }
        const bot = {
            user: { id: 'bot' },
            sequelize: { models: { Guild, User, GuildUser, Reaction } },
            logger: { debug: jest.fn(), error: jest.fn(), info: jest.fn() },
            locateLeaderboardsForReaction: jest.fn().mockResolvedValue(['lb']),
            createOrUpdateLeaderboardEmbed: jest.fn()
        } as any
        const event = new ReactionRemoved()
        await event.execute({ args: [messageReaction, reactor], bot })
        expect(Reaction.destroy).toHaveBeenCalledWith({ where: { uuid: 'r1' } })
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
        const Reaction = {
            findOne: jest.fn(),
            destroy: jest.fn()
        }
        const bot = {
            user: { id: 'bot' },
            sequelize: { models: { Guild, User, GuildUser, Reaction } },
            logger: { debug: jest.fn(), error: jest.fn(), info: jest.fn() },
            locateLeaderboardsForReaction: jest.fn(),
            createOrUpdateLeaderboardEmbed: jest.fn()
        } as any
        const event = new ReactionRemoved()
        await event.execute({ args: [messageReaction, reactor], bot })
        expect(messageReaction.fetch).toHaveBeenCalled()
        expect(bot.logger.error).toHaveBeenCalled()
        expect(Reaction.destroy).not.toHaveBeenCalled()
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
        const Reaction = {
            findOne: jest.fn(),
            destroy: jest.fn()
        }
        const bot = {
            user: { id: 'bot' },
            sequelize: { models: { Guild, User, GuildUser, Reaction } },
            logger: { debug: jest.fn(), error: jest.fn(), info: jest.fn() },
            locateLeaderboardsForReaction: jest.fn(),
            createOrUpdateLeaderboardEmbed: jest.fn()
        } as any
        const event = new ReactionRemoved()
        await event.execute({ args: [messageReaction, reactor], bot })
        expect(bot.logger.error).toHaveBeenCalledWith(
            'Failed to log reaction, could not identify message author'
        )
        expect(Reaction.destroy).not.toHaveBeenCalled()
    })

    it('returns when reaction lookup fails', async () => {
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
        const Reaction = {
            findOne: jest.fn().mockResolvedValue(null),
            destroy: jest.fn()
        }
        const bot = {
            user: { id: 'bot' },
            sequelize: { models: { Guild, User, GuildUser, Reaction } },
            logger: { debug: jest.fn(), error: jest.fn(), info: jest.fn() },
            locateLeaderboardsForReaction: jest.fn(),
            createOrUpdateLeaderboardEmbed: jest.fn()
        } as any
        const event = new ReactionRemoved()
        await event.execute({ args: [messageReaction, reactor], bot })
        expect(bot.logger.error).toHaveBeenCalledWith(
            "Couldn't locate a reaction to delete"
        )
        expect(Reaction.destroy).not.toHaveBeenCalled()
    })
})

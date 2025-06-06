import ReactionAdded from '../../src/events/ReactionAdded'
jest.mock('../../src/util/emoji', () => ({
    getEmojiType: jest.fn().mockReturnValue('emoji'),
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

    it('handles partial message fetch failure', async () => {
        const messageReaction = {
            partial: true,
            fetch: jest.fn().mockRejectedValue('fail'),
            emoji: { name: '😀', id: null, animated: false },
            message: {
                author: { id: 'u1', bot: false },
                id: 'm1',
                guildId: 'g1'
            }
        } as any
        const reactor = { id: 'u2', bot: false } as any
        const bot = {
            user: { id: 'bot' },
            sequelize: { models: { Guild: {}, User: {}, GuildUser: {}, Reaction: {} } },
            logger: { debug: jest.fn(), error: jest.fn() },
            locateLeaderboardsForReaction: jest.fn(),
            createOrUpdateLeaderboardEmbed: jest.fn()
        } as any
        const event = new ReactionAdded()
        await event.execute({ args: [messageReaction, reactor], bot })
        expect(messageReaction.fetch).toHaveBeenCalled()
        expect(bot.logger.error).toHaveBeenCalled()
        expect(bot.createOrUpdateLeaderboardEmbed).not.toHaveBeenCalled()
    })

    it('logs when message author is missing', async () => {
        const messageReaction = {
            partial: false,
            emoji: { name: '😀', id: null, animated: false },
            message: { author: null, id: 'm1', guildId: 'g1' }
        } as any
        const reactor = { id: 'u2', bot: false } as any
        const bot = {
            user: { id: 'bot' },
            sequelize: { models: { Guild: {}, User: {}, GuildUser: {}, Reaction: {} } },
            logger: { debug: jest.fn(), error: jest.fn() },
            locateLeaderboardsForReaction: jest.fn(),
            createOrUpdateLeaderboardEmbed: jest.fn()
        } as any
        const event = new ReactionAdded()
        await event.execute({ args: [messageReaction, reactor], bot })
        expect(bot.logger.error).toHaveBeenCalledWith(
            'Failed to log reaction, could not identify message author'
        )
        expect(bot.createOrUpdateLeaderboardEmbed).not.toHaveBeenCalled()
    })

    it('logs when guild id is missing', async () => {
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
        const Guild = { findOrCreate: jest.fn().mockResolvedValue([{ uuid: 'gid' }, false]) }
        const User = { findOrCreate: jest.fn().mockResolvedValue([{ uuid: 'uid' }, false]) }
        const GuildUser = { create: jest.fn() }
        const bot = {
            user: { id: 'bot' },
            sequelize: { models: { Guild, User, GuildUser, Reaction: {} } },
            logger: { debug: jest.fn(), error: jest.fn() },
            locateLeaderboardsForReaction: jest.fn(),
            createOrUpdateLeaderboardEmbed: jest.fn()
        } as any
        const event = new ReactionAdded()
        await event.execute({ args: [messageReaction, reactor], bot })
        expect(bot.logger.error).toHaveBeenCalledWith(
            'Failed to log reaction, could not locate guild'
        )
        expect(bot.createOrUpdateLeaderboardEmbed).not.toHaveBeenCalled()
    })

    it('logs when emoji type cannot be determined', async () => {
        const emojiUtil = require('../../src/util/emoji') as any
        emojiUtil.getEmojiType.mockReturnValueOnce(undefined)

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
        const bot = {
            user: { id: 'bot' },
            sequelize: { models: { Guild, User, GuildUser, Reaction: {} } },
            logger: { debug: jest.fn(), error: jest.fn() },
            locateLeaderboardsForReaction: jest.fn(),
            createOrUpdateLeaderboardEmbed: jest.fn()
        } as any
        const event = new ReactionAdded()
        await event.execute({ args: [messageReaction, reactor], bot })
        expect(bot.logger.error).toHaveBeenCalledWith('Failed to determine emoji type')
        expect(bot.createOrUpdateLeaderboardEmbed).not.toHaveBeenCalled()
    })
})

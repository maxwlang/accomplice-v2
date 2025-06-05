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
})

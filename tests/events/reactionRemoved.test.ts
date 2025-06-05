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
})

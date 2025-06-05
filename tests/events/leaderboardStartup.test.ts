import LeaderboardStartup from '../../src/events/LeaderboardStartup'

describe('LeaderboardStartup event', () => {
    it('updates all leaderboards on startup', async () => {
        const event = new LeaderboardStartup()
        const findAll = jest
            .fn()
            .mockResolvedValue([{ uuid: 'a' }, { uuid: 'b' }])
        const bot = {
            sequelize: { models: { Leaderboard: { findAll } } },
            createOrUpdateLeaderboardEmbed: jest.fn()
        } as any
        await event.execute({ bot })
        expect(bot.createOrUpdateLeaderboardEmbed).toHaveBeenCalledTimes(2)
        expect(bot.createOrUpdateLeaderboardEmbed).toHaveBeenCalledWith('a')
        expect(bot.createOrUpdateLeaderboardEmbed).toHaveBeenCalledWith('b')
    })
})

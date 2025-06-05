import LeaderboardDefaultTrackerTimeout from '../../src/events/LeaderboardDefaultTrackerTimeout'

describe('LeaderboardDefaultTrackerTimeout event', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })
    afterEach(() => {
        jest.useRealTimers()
    })

    it('updates leaderboard after timeout', async () => {
        const event = new LeaderboardDefaultTrackerTimeout()
        const deferUpdate = jest.fn()
        const interaction = {
            customId: 'leaderboardSelect:lb1',
            values: ['track2'],
            deferUpdate
        } as any
        const findOneLB = jest.fn().mockResolvedValue({ uuid: 'lb1', defaultTrackerTimeout: 1 })
        const findOneTracker = jest.fn().mockResolvedValue({ trackerId: 'track1' })
        const timers = new Map<string, NodeJS.Timeout>()
        const bot = {
            sequelize: { models: { Leaderboard: { findOne: findOneLB }, LeaderboardTrackers: { findOne: findOneTracker } } },
            timers,
            logger: { debug: jest.fn() },
            createOrUpdateLeaderboardEmbed: jest.fn()
        } as any
        await event.execute({ args: [interaction], bot })
        expect(timers.size).toBe(1)
        await jest.advanceTimersByTimeAsync(1000)
        expect(bot.createOrUpdateLeaderboardEmbed).toHaveBeenCalledWith('lb1', 'track1')
        expect(deferUpdate).toHaveBeenCalled()
    })
})

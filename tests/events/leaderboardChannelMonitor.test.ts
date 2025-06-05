import LeaderboardChannelMonitor from '../../src/events/LeaderboardChannelMonitor'

describe('LeaderboardChannelMonitor event', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('deletes messages in leaderboard channels', async () => {
        const warnDelete = jest.fn().mockResolvedValue(undefined)
        const warnMessage = { delete: warnDelete }
        const reply = jest.fn().mockResolvedValue(warnMessage)
        const messageDelete = jest.fn()
        const message = {
            author: { id: 'user' },
            channel: { id: 'chan' },
            reply,
            delete: messageDelete
        } as any
        const findOne = jest
            .fn()
            .mockResolvedValue({ deleteUserMessages: true })
        const bot = {
            user: { id: 'bot' },
            sequelize: { models: { Leaderboard: { findOne } } },
            logger: {}
        } as any
        const event = new LeaderboardChannelMonitor()
        await event.execute({ args: [message], bot })
        expect(reply).toHaveBeenCalled()
        await jest.runAllTimersAsync()
        expect(messageDelete).toHaveBeenCalled()
        expect(warnDelete).toHaveBeenCalled()
    })
})

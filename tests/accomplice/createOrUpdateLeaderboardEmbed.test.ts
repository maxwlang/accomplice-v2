import Accomplice from '../../src/accomplice'

jest.mock('../../src/embeds/Leaderboard', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
        getEmbed: jest.fn().mockReturnValue({}),
        getComponents: jest.fn().mockReturnValue([])
    }))
}))

describe('createOrUpdateLeaderboardEmbed', () => {
    it('edits existing message when found', async () => {
        const edit = jest.fn()
        const leaderboard = {
            uuid: 'lb1',
            channelSnowflake: 'chan',
            messageSnowflake: 'msg1',
            defaultLeaderboardTrackerId: null
        }
        const Leaderboard = {
            findOne: jest.fn().mockResolvedValue(leaderboard),
            update: jest.fn()
        }
        const LeaderboardTrackers = {
            findAll: jest.fn().mockResolvedValue([])
        }
        const Tracker = { findAll: jest.fn().mockResolvedValue([]) }
        const bot = {
            sequelize: {
                models: { Leaderboard, LeaderboardTrackers, Tracker },
                query: jest.fn().mockResolvedValue([])
            },
            channels: {
                resolve: jest.fn().mockReturnValue({
                    isTextBased: () => true,
                    fetch: jest.fn(),
                    messages: {
                        fetch: jest.fn().mockResolvedValue(
                            new Map([['msg1', { edit, delete: jest.fn() }]])
                        )
                    }
                })
            },
            logger: { debug: jest.fn(), error: jest.fn() }
        } as any
        await Accomplice.prototype.createOrUpdateLeaderboardEmbed.call(bot, 'lb1')
        expect(edit).toHaveBeenCalled()
        expect(Leaderboard.update).not.toHaveBeenCalled()
    })

    it('creates message when none found', async () => {
        const send = jest.fn().mockResolvedValue({ id: 'new' })
        const leaderboard = {
            uuid: 'lb1',
            channelSnowflake: 'chan',
            messageSnowflake: 'msg1',
            defaultLeaderboardTrackerId: null
        }
        const Leaderboard = {
            findOne: jest.fn().mockResolvedValue(leaderboard),
            update: jest.fn()
        }
        const LeaderboardTrackers = {
            findAll: jest.fn().mockResolvedValue([])
        }
        const Tracker = { findAll: jest.fn().mockResolvedValue([]) }
        const bot = {
            sequelize: {
                models: { Leaderboard, LeaderboardTrackers, Tracker },
                query: jest.fn().mockResolvedValue([])
            },
            channels: {
                resolve: jest.fn().mockReturnValue({
                    isTextBased: () => true,
                    fetch: jest.fn(),
                    messages: { fetch: jest.fn().mockResolvedValue(new Map()) },
                    send
                })
            },
            logger: { debug: jest.fn(), error: jest.fn() }
        } as any
        await Accomplice.prototype.createOrUpdateLeaderboardEmbed.call(bot, 'lb1')
        expect(send).toHaveBeenCalled()
        expect(Leaderboard.update).toHaveBeenCalledWith(
            { messageSnowflake: 'new' },
            { where: { uuid: 'lb1' } }
        )
    })

    it('logs when channel invalid', async () => {
        const leaderboard = {
            uuid: 'lb1',
            channelSnowflake: 'chan',
            messageSnowflake: null,
            defaultLeaderboardTrackerId: null
        }
        const Leaderboard = {
            findOne: jest.fn().mockResolvedValue(leaderboard)
        }
        const bot = {
            sequelize: { models: { Leaderboard } },
            channels: { resolve: jest.fn().mockReturnValue(undefined) },
            logger: { debug: jest.fn(), error: jest.fn() }
        } as any
        await Accomplice.prototype.createOrUpdateLeaderboardEmbed.call(bot, 'lb1')
        expect(bot.logger.error).toHaveBeenCalled()
    })
})

import Accomplice from '../../src/accomplice'

describe('cleanupLeftGuilds', () => {
    it('removes guilds not in fetch result', async () => {
        const findAll = jest
            .fn()
            .mockResolvedValue([{ snowflake: '1' }, { snowflake: '2' }])
        const fetch = jest.fn().mockResolvedValue(new Map([['1', {}]]))
        const cleanupGuildData = jest.fn()
        const bot = {
            sequelize: { models: { Guild: { findAll } } },
            guilds: { fetch },
            cleanupGuildData,
            logger: { info: jest.fn() }
        } as any
        await Accomplice.prototype.cleanupLeftGuilds.call(bot)
        expect(cleanupGuildData).toHaveBeenCalledWith('2')
    })
})

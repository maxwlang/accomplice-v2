describe('discord config', () => {
    beforeEach(() => {
        delete process.env.DISCORD_DISPLAY_NAME
        delete process.env.DISCORD_ACTIVITY_REFRESH_INTERVAL
        delete process.env.DISCORD_BOT_ADMIN_SNOWFLAKE
        jest.resetModules()
    })

    it('provides defaults', () => {
        const config = require('../../src/config/discord')
        expect(config.avatarDisplayName).toBe('Accomplice')
        expect(config.activityRefreshInterval).toBe(60 * 1000)
        expect(config.botAdminUserSnowflake).toBe('707022657354203180')
    })

    it('reads env vars', () => {
        process.env.DISCORD_DISPLAY_NAME = 'MyBot'
        process.env.DISCORD_ACTIVITY_REFRESH_INTERVAL = '2'
        process.env.DISCORD_BOT_ADMIN_SNOWFLAKE = '1'
        jest.resetModules()
        const config = require('../../src/config/discord')
        expect(config.avatarDisplayName).toBe('MyBot')
        expect(config.activityRefreshInterval).toBe(2 * 1000)
        expect(config.botAdminUserSnowflake).toBe('1')
    })
})

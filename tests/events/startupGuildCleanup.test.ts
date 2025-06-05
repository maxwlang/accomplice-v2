import StartupGuildCleanup from '../../src/events/StartupGuildCleanup'

describe('StartupGuildCleanup event', () => {
    it('cleans up guilds not present', async () => {
        const event = new StartupGuildCleanup()
        const bot = {
            cleanupLeftGuilds: jest.fn()
        } as any
        await event.execute({ bot })
        expect(bot.cleanupLeftGuilds).toHaveBeenCalled()
    })
})

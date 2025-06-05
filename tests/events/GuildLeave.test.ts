import GuildLeave from '../../src/events/GuildLeave'

describe('GuildLeave event', () => {
    it('cleans up guild data on leave', async () => {
        const guild = { id: 'g', name: 'Gone' } as any
        const cleanupGuildData = jest.fn()
        const info = jest.fn()
        const bot = {
            cleanupGuildData,
            logger: { info }
        } as any
        const event = new GuildLeave()
        await event.execute({ args: [guild], bot })
        expect(cleanupGuildData).toHaveBeenCalledWith('g')
        expect(info).toHaveBeenCalledWith('Left guild "Gone" (g)')
    })
})

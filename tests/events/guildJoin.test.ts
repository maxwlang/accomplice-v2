import GuildJoin from '../../src/events/GuildJoin'

describe('GuildJoin event', () => {
    it('sends welcome and registers commands', async () => {
        const react = jest.fn()
        const send = jest.fn().mockResolvedValue({ react })
        const channel = { send }
        const guild = { id: 'g1', name: 'Guild' } as any
        const findPublicChannel = jest.fn().mockReturnValue(channel)
        const registerCommands = jest.fn().mockResolvedValue(true)
        const prepareSynchronizeGuilds = jest.fn()
        const info = jest.fn()
        const findOrCreate = jest.fn().mockResolvedValue([])
        const bot = {
            user: { displayAvatarURL: jest.fn() },
            sequelize: { models: { Guild: { findOrCreate } } },
            findPublicChannel,
            prepareSynchronizeGuilds,
            registerCommands,
            logger: { info, error: jest.fn() }
        } as any
        const event = new GuildJoin()
        await event.execute({ args: [guild], bot })
        expect(findOrCreate).toHaveBeenCalled()
        expect(prepareSynchronizeGuilds).toHaveBeenCalledWith('g1')
        expect(send).toHaveBeenCalled()
        expect(react).toHaveBeenCalledWith('✅')
        expect(registerCommands).toHaveBeenCalledWith('g1')
        expect(info).toHaveBeenCalledWith('Joined guild "Guild" (g1)')
    })

    it('reacts with failure when command registration fails', async () => {
        const react = jest.fn()
        const send = jest.fn().mockResolvedValue({ react })
        const channel = { send }
        const guild = { id: 'g2', name: 'Guild2' } as any
        const findPublicChannel = jest.fn().mockReturnValue(channel)
        const registerCommands = jest.fn().mockResolvedValue(false)
        const findOrCreate = jest.fn().mockResolvedValue([])
        const bot = {
            user: { displayAvatarURL: jest.fn() },
            sequelize: { models: { Guild: { findOrCreate } } },
            findPublicChannel,
            prepareSynchronizeGuilds: jest.fn(),
            registerCommands,
            logger: { info: jest.fn(), error: jest.fn() }
        } as any
        const event = new GuildJoin()
        await event.execute({ args: [guild], bot })
        expect(react).toHaveBeenCalledWith('❌')
    })
})

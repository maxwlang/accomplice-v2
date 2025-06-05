beforeEach(() => {
    process.env.REDIS_ENABLED = 'true'
    jest.resetModules()
})

describe('start', () => {
    it('performs redis check and login', async () => {
        const { default: Accomplice } = await import('../../src/accomplice')
        const redis = {
            connect: jest.fn(),
            set: jest.fn(),
            get: jest.fn().mockResolvedValue('success'),
            del: jest.fn()
        }
        const bot = {
            redis,
            registerEvents: jest.fn(),
            login: jest.fn(),
            prepareSynchronizeGuilds: jest.fn(),
            registerCommandHandler: jest.fn(),
            registerCommands: jest.fn(),
            logger: { error: jest.fn(), debug: jest.fn(), info: jest.fn() }
        } as any
        await Accomplice.prototype.start.call(bot)
        expect(redis.connect).toHaveBeenCalled()
        expect(redis.set).toHaveBeenCalled()
        expect(redis.get).toHaveBeenCalled()
        expect(redis.del).toHaveBeenCalled()
        expect(bot.registerEvents).toHaveBeenCalled()
        expect(bot.login).toHaveBeenCalled()
        expect(bot.prepareSynchronizeGuilds).toHaveBeenCalled()
        expect(bot.registerCommandHandler).toHaveBeenCalled()
        expect(bot.registerCommands).toHaveBeenCalled()
    })
})

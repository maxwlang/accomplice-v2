import Accomplice from '../../src/accomplice'
import * as fs from 'fs/promises'

jest.mock('fs/promises', () => ({ readdir: jest.fn() }))

class DummyCommand {
    public meta = {
        name: 'dummy',
        description: 'd',
        toJSON: jest.fn().mockReturnValue({ name: 'dummy' })
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public async execute() {}
}

jest.mock('../../src/commands/Dummy.js', () => ({ __esModule: true, default: DummyCommand }), { virtual: true })

describe('registerCommands', () => {
    it('loads commands and registers with Discord', async () => {
        (fs.readdir as jest.Mock).mockResolvedValue(['Dummy.js'])
        const put = jest.fn().mockResolvedValue(undefined)
        const findOne = jest.fn().mockResolvedValue({ uuid: '1', commandsState: [] })
        const update = jest.fn()
        const bot = {
            user: { id: 'bot', fetch: jest.fn().mockResolvedValue({ id: 'bot' }) },
            rest: { put },
            guilds: { fetch: jest.fn().mockResolvedValue(new Map([['g1', { name: 'Guild' }]])) },
            sequelize: { models: { Guild: { findOne, update } } },
            commands: new Map(),
            timers: new Map(),
            logger: { debug: jest.fn(), error: jest.fn(), info: jest.fn() },
            findPublicChannel: jest.fn()
        } as any
        const success = await Accomplice.prototype.registerCommands.call(bot, 'g1')
        expect(put).toHaveBeenCalled()
        expect(success).toBe(true)
        expect(bot.commands.get('dummy')).toBeInstanceOf(DummyCommand)
    })

    it('throws when guild missing', async () => {
        (fs.readdir as jest.Mock).mockResolvedValue(['Dummy.js'])
        const bot = {
            user: { id: 'bot', fetch: jest.fn().mockResolvedValue({ id: 'bot' }) },
            rest: { put: jest.fn() },
            guilds: { fetch: jest.fn().mockResolvedValue(new Map()) },
            sequelize: { models: { Guild: { findOne: jest.fn(), update: jest.fn() } } },
            commands: new Map(),
            timers: new Map(),
            logger: { debug: jest.fn(), error: jest.fn(), info: jest.fn() },
            findPublicChannel: jest.fn()
        } as any
        await Accomplice.prototype.registerCommands.call(bot, 'missing')
        expect(bot.logger.error).toHaveBeenCalled()
    })
})

import PingCommand from '../../src/commands/Ping'

describe('Ping command', () => {
    it('replies with Pong!', async () => {
        const reply = jest.fn()
        const interaction = { reply } as any
        const cmd = new PingCommand()
        await cmd.execute({ interaction })
        expect(reply).toHaveBeenCalledWith('Pong!')
    })
})

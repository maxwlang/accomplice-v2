import PingCommand from '../../src/commands/Ping'

describe('Ping command', () => {
    it('replies with Pong!', async () => {
        const reply = jest.fn()
        const interaction = { reply } as any
        const cmd = new PingCommand()
        await cmd.execute({ interaction })
        const response = reply.mock.calls[0][0]
        expect(response.embeds).toHaveLength(1)
        const embed = response.embeds[0]
        expect(embed.data.description).toBe('Pong!')
    })
})

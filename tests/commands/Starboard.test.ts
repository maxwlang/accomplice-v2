import StarboardCommand from '../../src/commands/Starboard'

describe('Starboard command', () => {
  it('replies with Pong!', async () => {
    const reply = jest.fn()
    const interaction = { reply } as any
    const cmd = new StarboardCommand()
    await cmd.execute({ interaction })
    const embed = reply.mock.calls[0][0].embeds[0]
    expect(embed.data.description).toBe('Pong!')
  })
})

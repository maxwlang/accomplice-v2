import PriorityCommand from '../../src/commands/Priority'

describe('Priority command', () => {
  it('replies with Pong!', async () => {
    const reply = jest.fn()
    const interaction = { reply } as any
    const cmd = new PriorityCommand()
    await cmd.execute({ interaction })
    const embed = reply.mock.calls[0][0].embeds[0]
    expect(embed.data.description).toBe('Pong!')
  })
})

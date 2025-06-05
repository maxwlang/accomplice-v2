import DebugCommand from '../../src/commands/Debug'

describe('Debug command', () => {
  it('rejects non-admin users', async () => {
    const reply = jest.fn()
    const interaction = {
      user: { id: '123' },
      options: { getSubcommand: jest.fn() },
      reply
    } as any
    const cmd = new DebugCommand()
    await cmd.execute({ bot: {} as any, interaction })
    const embed = reply.mock.calls[0][0].embeds[0]
    expect(embed.data.title).toBe('Permission Denied')
  })
})

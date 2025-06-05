import TrackerCommand from '../../src/commands/Tracker'

describe('Tracker command', () => {
  it('handles unknown subcommand', async () => {
    const reply = jest.fn()
    const interaction = { options: { getSubcommand: () => 'bad' }, reply } as any
    const cmd = new TrackerCommand()
    await cmd.execute({ bot: {} as any, interaction })
    const embed = reply.mock.calls[0][0].embeds[0]
    expect(embed.data.title).toBe('Error')
  })
})

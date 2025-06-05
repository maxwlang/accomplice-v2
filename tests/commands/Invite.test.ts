import InviteCommand from '../../src/commands/Invite'

describe('Invite command', () => {
  it('sends invite link', async () => {
    const reply = jest.fn()
    const generateInvite = jest.fn().mockReturnValue('http://link')
    const interaction = { reply } as any
    const bot = { generateInvite } as any
    const cmd = new InviteCommand()
    await cmd.execute({ bot, interaction })
    expect(generateInvite).toHaveBeenCalled()
    const embed = reply.mock.calls[0][0].embeds[0]
    expect(embed.data.description).toContain('http://link')
  })
})

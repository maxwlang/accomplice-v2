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

  it('showTimers reports empty list', async () => {
    const reply = jest.fn()
    const interaction = { reply } as any
    const bot = { timers: new Map() } as any
    const cmd = new DebugCommand()
    await cmd.showTimers(bot, interaction)
    const embed = reply.mock.calls[0][0].embeds[0]
    expect(embed.data.description).toBe('No timers in memory.')
  })

  it('showTimers lists timers when present', async () => {
    const reply = jest.fn()
    const interaction = { reply } as any
    const bot = { timers: new Map([['t1', 1], ['t2', 2]]) } as any
    const cmd = new DebugCommand()
    await cmd.showTimers(bot, interaction)
    const embed = reply.mock.calls[0][0].embeds[0]
    expect(embed.data.description).toContain('t1')
    expect(embed.data.description).toContain('t2')
  })

  it('clearTimer handles unknown timer', async () => {
    const reply = jest.fn()
    const interaction = { options: { getString: () => 't1' }, reply } as any
    const bot = { timers: new Map() } as any
    const cmd = new DebugCommand()
    await cmd.clearTimer(bot, interaction)
    const embed = reply.mock.calls[0][0].embeds[0]
    expect(embed.data.description).toBe('No timer found with name t1.')
  })

  it('showEmbed reports missing file', async () => {
    const reply = jest.fn()
    const interaction = {
      options: { getString: (name: string) => (name === 'embed-name' ? 'nope' : null) },
      reply
    } as any
    const cmd = new DebugCommand()
    await cmd.showEmbed({} as any, interaction)
    expect(reply).toHaveBeenCalledWith('No embed found with name nope.')
  })
})

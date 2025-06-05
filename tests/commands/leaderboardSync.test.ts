import LeaderboardCommand from '../../src/commands/Leaderboard'

describe('Leaderboard synchronize command', () => {
  it('syncs a specific channel when provided', async () => {
    const cmd = new LeaderboardCommand()
    const reply = jest.fn()
    const followUp = jest.fn()
    const channel = { isTextBased: () => true } as any
    const bot = { synchronizeChannel: jest.fn() } as any
    const interaction = {
      guildId: '1',
      options: {
        getSubcommand: () => 'synchronize',
        getChannel: () => channel,
        getBoolean: () => false
      },
      reply,
      followUp
    } as any
    await cmd.execute({ bot, interaction })
    expect(bot.synchronizeChannel).toHaveBeenCalledWith(channel, interaction)
  })

  it('requires confirmation for full guild sync', async () => {
    const cmd = new LeaderboardCommand()
    const reply = jest.fn()
    const interaction = {
      guildId: '1',
      options: {
        getSubcommand: () => 'synchronize',
        getChannel: () => null,
        getBoolean: () => false
      },
      reply
    } as any
    await cmd.execute({ bot: {} as any, interaction })
    expect(reply).toHaveBeenCalledWith('Confirmation required to resync entire guild')
  })

  it('syncs entire guild when confirmed', async () => {
    const cmd = new LeaderboardCommand()
    const reply = jest.fn()
    const bot = { prepareSynchronizeGuilds: jest.fn() } as any
    const interaction = {
      guildId: '1',
      options: {
        getSubcommand: () => 'synchronize',
        getChannel: () => null,
        getBoolean: () => true
      },
      reply
    } as any
    await cmd.execute({ bot, interaction })
    expect(bot.prepareSynchronizeGuilds).toHaveBeenCalledWith('1', interaction)
  })
})

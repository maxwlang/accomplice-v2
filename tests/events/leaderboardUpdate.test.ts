import LeaderboardUpdate from '../../src/events/LeaderboardUpdate'

describe('LeaderboardUpdate event', () => {
  it('updates leaderboard when interaction matches', async () => {
    const event = new LeaderboardUpdate()
    const deferUpdate = jest.fn()
    const interaction = {
      customId: 'leaderboardSelect:lb1',
      values: ['tracker1'],
      deferUpdate
    } as any
    const bot = {
      createOrUpdateLeaderboardEmbed: jest.fn()
    } as any
    await event.execute({ args: [interaction], bot })
    expect(bot.createOrUpdateLeaderboardEmbed).toHaveBeenCalledWith('lb1', 'tracker1')
    expect(deferUpdate).toHaveBeenCalled()
  })

  it('ignores unrelated interaction', async () => {
    const event = new LeaderboardUpdate()
    const deferUpdate = jest.fn()
    const interaction = { customId: 'other', values: ['t'], deferUpdate } as any
    const bot = {
      createOrUpdateLeaderboardEmbed: jest.fn()
    } as any
    await event.execute({ args: [interaction], bot })
    expect(bot.createOrUpdateLeaderboardEmbed).not.toHaveBeenCalled()
    expect(deferUpdate).not.toHaveBeenCalled()
  })
})


describe('BotOnline event', () => {
  beforeEach(() => {
    delete process.env.DISCORD_DISPLAY_NAME
    jest.resetModules()
  })

  it('sets username and logs message', async () => {
    process.env.DISCORD_DISPLAY_NAME = 'UnitBot'
    jest.resetModules()
    const event = new (require('../../src/events/BotOnline').default)()
    const setUsername = jest.fn()
    const info = jest.fn()
    const bot = { logger: { info }, user: { setUsername } } as any
    await event.execute({ bot })
    expect(setUsername).toHaveBeenCalledWith('UnitBot')
    expect(info).toHaveBeenCalledWith('UnitBot has logged in!')
  })
})


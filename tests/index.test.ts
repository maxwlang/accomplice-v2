const mockLogger = { info: jest.fn(), error: jest.fn() }
const mockStart = jest.fn()

jest.mock('../src/modules/logger', () => ({ __esModule: true, default: mockLogger }))
jest.mock('../src/accomplice', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({ start: mockStart })) }))
jest.mock('../src/sequelize/models', () => ({
  __esModule: true,
  default: {
    sequelize: {
      authenticate: jest.fn().mockResolvedValue(undefined),
      models: {
        Guild: { count: jest.fn().mockResolvedValue(0) },
        Starboard: { count: jest.fn().mockResolvedValue(0) },
        Leaderboard: { count: jest.fn().mockResolvedValue(0) },
        User: { count: jest.fn().mockResolvedValue(0) }
      }
    }
  }
}))
jest.mock('fs', () => ({ existsSync: jest.fn(() => true), mkdirSync: jest.fn(), writeFileSync: jest.fn() }))

describe('index bootstrap', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it('initializes and starts the bot', async () => {
    await import('../src/index')
    await new Promise(res => setImmediate(res))
    expect(mockLogger.info).toHaveBeenCalledWith('Loading database..')
    expect(mockStart).toHaveBeenCalled()
  })
})

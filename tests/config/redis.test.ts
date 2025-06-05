
describe('redis config', () => {
  beforeEach(() => {
    delete process.env.REDIS_URL
    delete process.env.REDIS_PREFIX
    delete process.env.REDIS_ENABLED
    delete process.env.REDIS_PASSWORD
    jest.resetModules()
  })

  it('uses defaults when env vars not set', () => {
    const redis = require('../../src/config/redis')
    expect(redis.redisURL).toBe('redis://localhost:6379')
    expect(redis.redisPrefix).toBe('accomplice_')
    expect(redis.redisEnabled).toBe(false)
    expect(redis.redisPassword).toBeUndefined()
  })

  it('reads env vars correctly', () => {
    process.env.REDIS_URL = 'redis://example.com:9999'
    process.env.REDIS_PREFIX = 'test_'
    process.env.REDIS_ENABLED = 'true'
    process.env.REDIS_PASSWORD = 'secret'
    jest.resetModules()
    const redis = require('../../src/config/redis')
    expect(redis.redisURL).toBe('redis://example.com:9999')
    expect(redis.redisPrefix).toBe('test_')
    expect(redis.redisEnabled).toBe(true)
    expect(redis.redisPassword).toBe('secret')
  })
})


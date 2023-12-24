export const redisURL = process.env['REDIS_URL'] || 'redis://localhost:6379'
export const redisPrefix = process.env['REDIS_PREFIX'] || 'accomplice_'
export const redisEnabled = process.env['REDIS_ENABLED'] === 'true' || false
export const redisPassword = process.env['REDIS_PASSWORD'] || undefined

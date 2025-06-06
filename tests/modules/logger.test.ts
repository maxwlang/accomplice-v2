jest.mock('fs/promises', () => ({ mkdir: jest.fn().mockResolvedValue(undefined) }))

describe('logger module', () => {
    beforeEach(() => {
        delete process.env.LOG_LEVEL
        delete process.env.LOG_TO_FILE
        jest.resetModules()
    })

    it('uses level from config', () => {
        process.env.LOG_LEVEL = 'error'
        jest.resetModules()
        const logger = require('../../src/modules/logger').default
        expect(logger.level).toBe('error')
    })

    it('calls mkdir when LOG_TO_FILE set', async () => {
        process.env.LOG_TO_FILE = 'true'
        jest.resetModules()
        const { mkdir } = require('fs/promises')
        require('../../src/modules/logger')
        expect(mkdir).toHaveBeenCalledWith('./data')
    })
})

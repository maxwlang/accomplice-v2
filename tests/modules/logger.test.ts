describe('logger module', () => {
    beforeEach(() => {
        delete process.env.LOG_LEVEL
        jest.resetModules()
    })

    it('uses level from config', () => {
        process.env.LOG_LEVEL = 'error'
        jest.resetModules()
        const logger = require('../../src/modules/logger').default
        expect(logger.level).toBe('error')
    })
})

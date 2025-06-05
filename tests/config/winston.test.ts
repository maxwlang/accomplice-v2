describe('winston config', () => {
    beforeEach(() => {
        delete process.env.LOG_LEVEL
        jest.resetModules()
    })

    it('defaults to debug', () => {
        const { logLevel } = require('../../src/config/winston')
        expect(logLevel).toBe('debug')
    })

    it('reads from LOG_LEVEL', () => {
        process.env.LOG_LEVEL = 'warn'
        jest.resetModules()
        const { logLevel } = require('../../src/config/winston')
        expect(logLevel).toBe('warn')
    })
})

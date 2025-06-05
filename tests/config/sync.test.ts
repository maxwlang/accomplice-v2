describe('sync config', () => {
    beforeEach(() => {
        delete process.env.MESSAGE_SYNC_LIMIT
        jest.resetModules()
    })

    it('uses default value', () => {
        const config = require('../../src/config/sync')
        expect(config.messageSyncLimit).toBe(50000)
    })

    it('reads MESSAGE_SYNC_LIMIT env', () => {
        process.env.MESSAGE_SYNC_LIMIT = '1234'
        jest.resetModules()
        const config = require('../../src/config/sync')
        expect(config.messageSyncLimit).toBe(1234)
    })
})

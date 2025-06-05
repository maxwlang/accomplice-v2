import ActivityRotation from '../../src/events/ActivityRotation'
import * as discordConfig from '../../src/config/discord'

describe('ActivityRotation event', () => {
    beforeEach(() => {
        jest.useFakeTimers()
        jest.spyOn(Math, 'random').mockReturnValue(0)
    })

    afterEach(() => {
        jest.useRealTimers()
        jest.restoreAllMocks()
    })

    it('updates bot activity on interval', async () => {
        const setActivity = jest.fn()
        const debug = jest.fn()
        const bot = { user: { setActivity }, logger: { debug } } as any
        const event = new ActivityRotation()
        await event.execute({ bot })

        expect(setActivity).toHaveBeenCalledTimes(1)

        jest.advanceTimersByTime(discordConfig.activityRefreshInterval)

        expect(setActivity).toHaveBeenCalledTimes(2)
    })
})

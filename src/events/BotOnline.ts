import Accomplice from '../accomplice'
import EventHandle from '../types/EventHandle'

export default class BotOnline implements EventHandle {
    public name = 'Bot Online'
    public description = 'Shows a simple message when logged in'
    public trigger = 'ready'
    public fireOnce = true

    public execute = async ({ bot }: { bot: Accomplice }): Promise<void> => {
        bot.logger.info('Accomplice has logged in!')
        return
    }
}

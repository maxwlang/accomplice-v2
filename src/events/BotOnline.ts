import Accomplice from '../accomplice'
import EventHandle from '../types/EventHandle'
import { avatarDisplayName, avatarUrl } from '../config/discord'

export default class BotOnline implements EventHandle {
    public name = 'Bot Online'
    public description = 'Handles small tasks once logged in'
    public trigger = 'ready'
    public fireOnce = true

    public execute = async ({ bot }: { bot: Accomplice }): Promise<void> => {
        bot.logger.info('Accomplice has logged in!')
        if (bot.user) {
            if (avatarDisplayName) bot.user.setUsername(avatarDisplayName)
            if (avatarUrl) bot.user.setAvatar(avatarUrl)
        }
        return
    }
}

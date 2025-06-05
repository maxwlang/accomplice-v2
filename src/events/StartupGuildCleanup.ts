import Accomplice from '../accomplice'
import EventHandle from '../types/EventHandle'

export default class StartupGuildCleanup implements EventHandle {
    public name = 'Startup Guild Cleanup'
    public description = 'Removes data for guilds left while offline'
    public trigger = 'ready'
    public fireOnce = true

    public execute = async ({ bot }: { bot: Accomplice }): Promise<void> => {
        await bot.cleanupLeftGuilds()
    }
}

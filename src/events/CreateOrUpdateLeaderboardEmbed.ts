import Accomplice from '../accomplice'
import EventHandle from '../types/EventHandle'

export default class LeaderboardUpdate implements EventHandle {
    public name = 'Leaderboard Update'
    public description = 'Handles dropdown selection'
    public trigger = 'interactionCreate'
    public fireOnce = false

    public execute = async ({ bot }: { bot: Accomplice }): Promise<void> => {
        bot.logger.info('Hello world from inside test event!')
        return
    }
}

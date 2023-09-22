import Accomplice from '../accomplice'
import EventHandle from '../types/EventHandle'
import { Leaderboard } from '../sequelize/types/leaderboard'

export default class LeaderboardStartup implements EventHandle {
    public name = 'Leaderboard Startup'
    public description = 'Manages leaderboards on bot ready'
    public trigger = 'ready'
    public fireOnce = true

    public execute = async ({ bot }: { bot: Accomplice }): Promise<void> => {
        const { Leaderboard } = bot.sequelize.models
        const leaderboards: Leaderboard[] = await Leaderboard.findAll()

        const leaderboardTasks = leaderboards.map(leaderboard =>
            bot.createOrUpdateLeaderboardEmbed(leaderboard.uuid)
        )

        await Promise.allSettled(leaderboardTasks).catch(e => console.log(e))
    }
}

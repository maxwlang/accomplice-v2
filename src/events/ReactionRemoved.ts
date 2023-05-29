import Accomplice from '../accomplice'
import EventHandle from '../types/EventHandle'

export default class ReactionRemoved implements EventHandle {
    public name = 'Reaction Removed'
    public description = 'Updates counts for removed reactions'
    public trigger = 'messageReactionRemove'
    public fireOnce = false

    public execute = async ({ bot }: { bot: Accomplice }): Promise<void> => {
        bot.logger.info(`${this.trigger} fired`)

        // find or create reactee user
        // await User.findOrCreate({
        //     where: { snowflake: 'guh' },
        //     defaults: {
        //         uuid: uuidv4(),
        //         snowflake: 'guh',
        //         isBot: false
        //     }
        // })

        // find or create reactor user
        // await User.findOrCreate({
        //     where: { snowflake: 'guh' },
        //     defaults: {
        //         uuid: uuidv4(),
        //         snowflake: 'guh',
        //         isBot: false
        //     }
        // })

        // react delete

        // update leaderboard
        return
    }
}

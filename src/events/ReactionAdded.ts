import Accomplice from '../accomplice'
import EventHandle from '../types/EventHandle'
// import { v4 as uuidv4 } from 'uuid'
import { isEmpty } from 'ramda'

export default class ReactionAdded implements EventHandle {
    public name = 'Reaction Added'
    public description = 'Updates counts for added reactions'
    public trigger = 'messageReactionAdd'
    public fireOnce = false

    public execute = async ({
        args,
        bot
    }: {
        args?: unknown[]
        bot: Accomplice
    }): Promise<void> => {
        if (!args || isEmpty(args)) return
        console.log(args)
        // const { User } = bot.sequelize.models

        bot.logger.debug(`User has reacted`)

        // await User.findOrCreate({
        //     where: { snowflake: 'guh' },
        //     defaults: {
        //         uuid: uuidv4(),
        //         snowflake: 'guh',
        //         isBot: false
        //     }
        // })

        // react create
    }
}

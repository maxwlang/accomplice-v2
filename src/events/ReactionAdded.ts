import Accomplice from '../accomplice'
import EventHandle from '../types/EventHandle'

export default class ReactionAdded implements EventHandle {
    public name = 'Reaction Added'
    public description = 'Updates counts for added reactions'
    public trigger = 'messageReactionAdd'
    public fireOnce = false

    public execute = async ({ bot }: { bot: Accomplice }): Promise<void> => {
        bot.logger.info('Hello world from inside test event!')
        return
    }
}

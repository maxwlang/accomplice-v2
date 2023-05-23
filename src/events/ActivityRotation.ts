import { ActivityType } from 'discord.js'
import Accomplice from '../accomplice'
import EventHandle from '../types/EventHandle'
import { ActivitiesOptions } from 'discord.js'
import { activityRefreshInterval } from '../config/discord'

export default class ActivityRotation implements EventHandle {
    public name = 'Activity Rotation'
    public description = 'Rotates activity text'
    public trigger = 'ready'
    public fireOnce = true

    private updateActivity = (bot: Accomplice): void => {
        if (!bot.user) return

        const activity: ActivitiesOptions = {
            name: getRandomProp(activityNames),
            type: getRandomProp(activityTypes),
            url: getRandomProp(urls)
        }
        bot.user.setActivity(activity)
        bot.logger.debug('Bot activity status changed')
    }

    public execute = async ({ bot }: { bot: Accomplice }): Promise<void> => {
        setInterval(() => this.updateActivity(bot), activityRefreshInterval)
        this.updateActivity(bot)
    }
}

const activityNames = [
    "Garry's Mod",
    'Reddit',
    'Porn Hub',
    'Pooping With Friends',
    'the stars',
    'your messages',
    'grandma',
    'the voices',
    'Sandwich Simulator'
]

const activityTypes: Exclude<ActivityType, ActivityType.Custom>[] = [
    ActivityType.Playing,
    ActivityType.Streaming,
    ActivityType.Listening,
    ActivityType.Watching,
    ActivityType.Competing
]

const urls = [
    'https://bing.chilling',
    'https://mcchickers.com',
    'https://walmart.com'
]

const getRandomProp = <T>(array: T[]): T =>
    array[Math.floor(Math.random() * array.length)]

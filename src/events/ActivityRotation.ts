import Accomplice from '../accomplice'
import { ActivitiesOptions } from 'discord.js'
import { ActivityType } from 'discord.js'
import EventHandle from '../types/EventHandle'
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
    'PornHub',
    'Pooping With Friends',
    'the stars',
    'your messages',
    'grandma',
    'the voices',
    'Sandwich Simulator'
    // 3 guilds
    // 3 starboards
    // 3 leaderboards
    // 500 users
    // 6000 reactions
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

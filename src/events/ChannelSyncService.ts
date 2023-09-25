import Accomplice from '../accomplice'
import EventHandle from '../types/EventHandle'
import { Guild } from '../sequelize/types/guild'

export default class ChannelRecoverySyncService implements EventHandle {
    public name = 'Channel Recovery Sync Service'
    public description =
        'Syncs the channel activity status with the database every 5 minutes'
    public trigger = 'ready'
    public fireOnce = true

    public execute = async ({ bot }: { bot: Accomplice }): Promise<void> => {
        // For each guild, check channel sync state on database
        const { Guild } = bot.sequelize.models

        const guilds: Guild[] = await Guild.findAll()

        for (const guild of guilds) {
            console.log('====', guild.channelsState, '====')
            // const channelState = JSON.parse(guild.channelsState)
        }
    }
}

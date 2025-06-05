import Accomplice from '../accomplice'
import EventHandle from '../types/EventHandle'
import { Guild } from 'discord.js'
import { isEmpty } from 'ramda'

export default class GuildLeave implements EventHandle {
    public name = 'Guild Left'
    public description = 'Occurs when bot leaves a guild'
    public trigger = 'guildDelete'
    public fireOnce = false

    public execute = async ({
        args,
        bot
    }: {
        args?: unknown[]
        bot: Accomplice
    }): Promise<void> => {
        if (!args || isEmpty(args)) return
        const guild = args[0] as Guild
        bot.logger.info(`Left guild "${guild.name}" (${guild.id})`)

        await bot.cleanupGuildData(guild.id)
    }
}

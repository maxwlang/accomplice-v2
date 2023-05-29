import { Guild } from 'discord.js'
import Accomplice from '../accomplice'
import EventHandle from '../types/EventHandle'
import { v4 as uuidv4 } from 'uuid'
import { isEmpty } from 'ramda'

export default class GuildJoin implements EventHandle {
    public name = 'Guild Joined'
    public description = 'Occurs when bot joins a guild'
    public trigger = 'guildCreate'
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
        const { Guild } = bot.sequelize.models

        bot.logger.info(`Joined guild "${guild.name}" (${guild.id})`)

        // [guildRow, created] =
        await Guild.findOrCreate({
            where: { snowflake: guild.id },
            defaults: {
                uuid: uuidv4(),
                snowflake: guild.id,
                isPriority: false
            }
        })

        await bot.registerCommands(guild.id)
    }
}

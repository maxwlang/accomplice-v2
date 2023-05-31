import { Guild, Message } from 'discord.js'
import Accomplice from '../accomplice'
import EventHandle from '../types/EventHandle'
import { v4 as uuidv4 } from 'uuid'
import { isEmpty } from 'ramda'
import Welcome from '../embeds/Welcome'

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

        await Guild.findOrCreate({
            where: { snowflake: guild.id },
            defaults: {
                uuid: uuidv4(),
                snowflake: guild.id,
                isPriority: false
            }
        })

        // Reaction Indexing

        // Welcome message
        let welcomeMessage: Message<true> | undefined
        const channel = bot.findPublicChannel(guild.id)

        if (channel) {
            const welcomeEmbed = new Welcome().getEmbed(
                bot.user?.displayAvatarURL({ size: 256 })
            )
            welcomeMessage = await channel
                .send({
                    embeds: [welcomeEmbed]
                })
                .catch(e => {
                    bot.logger.error(`Failed to send hello message: ${e}`)
                    return undefined
                })
        }

        // Register slash commands
        const registerResult = await bot.registerCommands(guild.id)
        if (welcomeMessage) {
            if (registerResult) {
                await welcomeMessage.react('✅')
            } else {
                await welcomeMessage.react('❌')
            }
        }
    }
}

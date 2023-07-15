import { isEmpty } from 'ramda'
import Accomplice from '../accomplice'
import EventHandle from '../types/EventHandle'
import { StringSelectMenuInteraction } from 'discord.js'

export default class LeaderboardUpdate implements EventHandle {
    public name = 'Leaderboard Update'
    public description = 'Handles dropdown selection'
    public trigger = 'interactionCreate'
    public fireOnce = false

    public execute = async ({
        args,
        bot
    }: {
        args?: unknown[]
        bot: Accomplice
    }): Promise<void> => {
        if (!args || isEmpty(args)) return
        bot.logger.info(`${this.trigger} fired`)
        const interaction = args[0] as StringSelectMenuInteraction
        // await interaction.deferReply() // defer update?
        const customId = interaction.customId
        if (customId.split(':')[0] !== 'leaderboardSelect') return
        const leaderboardId = customId.split(':')[1]
        console.log({ leaderboardId })

        await interaction.reply({
            content: 'Nah bruh, nah. Not setup yet bruh',
            ephemeral: true
        })

        return
    }
}

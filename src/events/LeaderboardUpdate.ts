import Accomplice from '../accomplice'
import EventHandle from '../types/EventHandle'
import { StringSelectMenuInteraction } from 'discord.js'
import { isEmpty } from 'ramda'

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
        const interaction = args[0] as StringSelectMenuInteraction
        const customId = interaction.customId
        if (!customId || customId.split(':')[0] !== 'leaderboardSelect') return

        const leaderboardId = customId.split(':')[1]
        const trackerId = interaction.values[0]

        await bot.createOrUpdateLeaderboardEmbed(leaderboardId, trackerId)
        await interaction.deferUpdate()

        return
    }
}

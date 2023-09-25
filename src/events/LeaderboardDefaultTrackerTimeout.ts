import Accomplice from '../accomplice'
import EventHandle from '../types/EventHandle'
import { Leaderboard } from '../sequelize/types/leaderboard'
import { LeaderboardTrackers } from '../sequelize/types/leaderboard_trackers'
import { StringSelectMenuInteraction } from 'discord.js'

export default class LeaderboardDefaultTrackerTimeout implements EventHandle {
    public name = 'Leaderboard Default Tracker Timeout'
    public description =
        'Monitors leaderboard component update events and resets the embed to the default tracker if the timeout is reached'
    public trigger = 'interactionCreate'
    public fireOnce = false

    public execute = async ({
        args,
        bot
    }: {
        args?: unknown[]
        bot: Accomplice
    }): Promise<void> => {
        if (!args) return
        const interaction = args[0] as StringSelectMenuInteraction
        const customId = interaction.customId
        const { Leaderboard, LeaderboardTrackers } = bot.sequelize.models
        if (!customId || customId.split(':')[0] !== 'leaderboardSelect') return

        const leaderboardId = customId.split(':')[1]
        const trackerId = interaction.values[0]

        const leaderboard: Leaderboard | undefined = await Leaderboard.findOne({
            where: {
                uuid: leaderboardId
            }
        })

        if (!leaderboard) return

        if (leaderboard.defaultTrackerTimeout) {
            const timeout = leaderboard.defaultTrackerTimeout * 1000

            const leaderboardTracker: LeaderboardTrackers | undefined =
                await LeaderboardTrackers.findOne({
                    where: {
                        leaderboardId
                    }
                })

            if (!leaderboardTracker) return

            const timerName = `leaderboardDefaultTrackerTimeout:${leaderboardId}`

            const timer = bot.timers.get(timerName)
            if (timer) {
                bot.logger.debug('Clearing existing timer')
                clearTimeout(timer)
                bot.timers.delete(timerName)

                if (leaderboardTracker.trackerId === trackerId) return
            }

            bot.logger.debug(`Setting timer for ${timeout}ms`)

            bot.timers.set(
                timerName,
                setTimeout(async () => {
                    bot.logger.debug(`Invoking timer ${timerName}`)
                    bot.timers.delete(timerName)
                    await bot.createOrUpdateLeaderboardEmbed(
                        leaderboardId,
                        leaderboardTracker.trackerId
                    )
                }, timeout)
            )
        }

        await interaction.deferUpdate()

        return
    }
}

import { Guild } from 'discord.js'
import { Guild as GuildRow } from '../sequelize/types/guild'
import Accomplice from '../accomplice'
import EventHandle from '../types/EventHandle'
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
        const {
            Guild,
            Starboard,
            Leaderboard,
            Reaction,
            GuildUsers,
            LeaderboardTrackers,
            Tracker
        } = bot.sequelize.models

        bot.logger.info(`Left guild "${guild.name}" (${guild.id})`)

        const guildRow: GuildRow = await Guild.findOne({
            where: { snowflake: guild.id }
        })
        if (guildRow === null || !guildRow) {
            bot.logger.error(`Failed to locate guild in database`)
            return
        }

        // Stop and remove any guild timers
        bot.timers.findKey((timer, key) => {
            if (key.startsWith(`${guild.id}_`)) {
                clearInterval(timer)
                bot.timers.delete(key)
            }
        })

        // Remove data
        await Promise.all([
            Guild.destroy({
                where: {
                    uuid: guildRow.uuid
                }
            }),
            Starboard.destroy({
                where: {
                    guildId: guildRow.uuid
                }
            }),
            Leaderboard.destroy({
                where: {
                    guildId: guildRow.uuid
                }
            }),
            Reaction.destroy({
                where: {
                    guildId: guildRow.uuid
                }
            }),
            GuildUsers.destroy({
                where: {
                    guildId: guildRow.uuid
                }
            }),
            LeaderboardTrackers.destroy({
                where: {
                    guildId: guildRow.uuid
                }
            }),
            Tracker.destroy({
                where: {
                    guildId: guildRow.uuid
                }
            })
        ])
    }
}

import Accomplice from '../accomplice'
import EventHandle from '../types/EventHandle'
import { Leaderboard } from '../sequelize/types/leaderboard'
import { Message } from 'discord.js'

export default class LeaderboardChannelMonitor implements EventHandle {
    public name = 'Leaderboard Channel Monitor'
    public description =
        'Monitors channels with deployed leaderboards, and deletes other messages when enabled'
    public trigger = 'messageCreate'
    public fireOnce = false

    public execute = async ({
        args,
        bot
    }: {
        args?: unknown[]
        bot: Accomplice
    }): Promise<void> => {
        if (!args) return
        const message = args[0] as Message
        if (message.author.id === bot.user?.id) return

        const { Leaderboard } = bot.sequelize.models

        const leaderboard: Leaderboard | undefined = await Leaderboard.findOne({
            where: {
                channelSnowflake: message.channel.id
            }
        })

        if (leaderboard && leaderboard.deleteUserMessages) {
            const warnMessage = await message
                .reply('Messages are not allowed in this channel.')
                .catch() // Ignore errors, we don't care if the message fails to send, we just want to delete the user's message

            setTimeout(async () => {
                await message.delete()
                await warnMessage.delete().catch()
            }, 3000)
        }
    }
}

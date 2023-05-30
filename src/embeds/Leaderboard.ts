import { EmbedBuilder } from 'discord.js'
import Embed from '../types/Embed'
import { Leaderboard } from '../sequelize/types/leaderboard'
// import { Tracker } from '../sequelize/types/tracker'

export default class LeaderboardEmbed implements Embed {
    public getEmbed({
        leaderboard
    }: // trackers
    {
        leaderboard: Leaderboard
        // trackers: Tracker[]
    }): EmbedBuilder {
        const embed = new EmbedBuilder()
            .setTitle('Leaderboard')
            .setColor('Gold')
            .setTimestamp()
            .setFooter({ text: `ref: ${leaderboard.uuid}` })
            .setThumbnail(
                'https://badgeos.org/wp-content/uploads/edd/2013/11/leaderboard.png'
            )

        embed.addFields(
            {
                name: '1. Max',
                value: '🐒 - 2,900',
                inline: true
            },
            {
                name: '2. Max',
                value: '🐒 - 2,400',
                inline: true
            },
            {
                name: '3. Max',
                value: '🐒 - 2,200',
                inline: true
            },
            {
                name: '4. Max',
                value: '🐒 - 2,000',
                inline: true
            },
            {
                name: '5. Max',
                value: '🐒 - 1,900',
                inline: true
            }
        )

        // embed.addFields({
        //     name: `${i + 1}. ${user.username}`,
        //     value: `${visualEmoji} - ${leaderboard[i].total}`,
        //     inline: true
        // })

        return embed
    }

    public getComponents = (): null => null
}

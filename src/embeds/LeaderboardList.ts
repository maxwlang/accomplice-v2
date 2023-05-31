import { EmbedBuilder, bold, channelMention } from 'discord.js'
import Embed from '../types/Embed'
import { Leaderboard } from '../sequelize/types/leaderboard'
import { isEmpty } from 'ramda'
import { avatarDisplayName } from '../config/discord'

export default class LeaderboardList implements Embed {
    public getEmbed(leaderboards: Leaderboard[]): EmbedBuilder {
        const embed = new EmbedBuilder()
            .setTitle('Leaderboards')
            .setColor('Blue')
            .setTimestamp()
            .setFooter({
                text: `Powered By ${avatarDisplayName}`
            })

        if (!leaderboards || isEmpty(leaderboards)) {
            return embed
                .setColor('Orange')
                .setDescription(
                    'There are no leaderboards configured for this guild'
                )
        } else {
            return embed.setDescription(
                `This guild has ${leaderboards.length} ${
                    leaderboards.length === 1 ? 'leaderboard' : 'leaderboards'
                }.\n\n${bold('Leaderboard Locations:')}\n${leaderboards
                    .map(
                        leaderboard =>
                            `- ${channelMention(leaderboard.channelSnowflake)}`
                    )
                    .join('\n')}`
            )
        }
    }

    public getComponents = (): null => null
}

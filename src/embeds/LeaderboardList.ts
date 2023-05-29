import { EmbedBuilder, channelMention } from 'discord.js'
import Embed from '../types/Embed'
import { Leaderboard } from '../sequelize/types/leaderboard'
import { isEmpty } from 'ramda'

export default class LeaderboardList implements Embed {
    public getEmbed(leaderboards: Leaderboard[]): EmbedBuilder {
        leaderboards = [
            {
                channel: '992684371117097081',
                guildId: 'aaaa-eeee-bbbb-cccc-eeee',
                uuid: 'rrfrr-eeee-aaas-ssss-tgggg'
            },
            {
                channel: '1085060769730801786',
                guildId: 'aaaa-eeee-bbbb-cccc-eeee',
                uuid: 'rrfrr-eeee-aaas-ssss-tgggg'
            }
        ]
        let embed = new EmbedBuilder()
            .setTitle('Leaderboards')
            .setColor('Blue')
            .setTimestamp()
            .setFooter({ text: 'Accomplice' })
        // iconURL: 'https://i.imgur.com/AfFp7pu.png'

        if (!leaderboards || isEmpty(leaderboards)) {
            return embed
                .setColor('Orange')
                .setDescription(
                    'There are no leaderboards configured for this guild'
                )
                .addFields({ name: 'Leaderboard Locations', value: '\u200B' })
        } else {
            embed = embed.setDescription(
                `This guild has ${leaderboards.length} ${
                    leaderboards.length === 1 ? 'leaderboard' : 'leaderboards'
                }.`
            )

            for (const leaderboard of leaderboards) {
                embed = embed.addFields({
                    name: '\u200B',
                    value: channelMention(leaderboard.channel),
                    inline: true
                })
            }

            return embed
        }
    }
}

import {
    // APIActionRowComponent,
    ActionRowBuilder,
    AnyComponentBuilder,
    // AnyComponentBuilder,
    // ComponentBuilder,
    // ComponentType,
    EmbedBuilder,
    // RestOrArray,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} from 'discord.js'
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
            .setDescription('')
            .setTimestamp()
            .setFooter({ text: `ref: ${leaderboard.uuid}` })
            .setThumbnail(
                'https://badgeos.org/wp-content/uploads/edd/2013/11/leaderboard.png'
            )

        embed.addFields(
            {
                name: '1. Cacax',
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
            },
            {
                name: '6. Max',
                value: '🐒 - 1,800',
                inline: true
            },
            {
                name: '7. Max',
                value: '🐒 - 1,700',
                inline: true
            },
            {
                name: '8. Max',
                value: '🐒 - 1,600',
                inline: true
            },
            {
                name: '9. Max',
                value: '🐒 - 1,500',
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

    public getComponents = (
        leaderboard: Leaderboard
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): ActionRowBuilder<AnyComponentBuilder> => {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`leaderboardSelect:${leaderboard.uuid}`)
            .setPlaceholder('Select a Tracker')
            .setMaxValues(1)
            .setMinValues(1)
            .setOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('⭐ Starboard')
                    .setEmoji('⭐')
                    .setValue('11111-22222-33333-44444-55555'),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Bitchboard')
                    .setEmoji('⭐')
                    .setValue('66666-777777-8888888-99999999')
            )

        return new ActionRowBuilder().addComponents(selectMenu)
    }
    // new MessageActionRowComponentBuilder().addComponents(
    //     new MessageSelectMenu()
    //         .setCustomId('updateLeaderboard')
    //         .setPlaceholder(`${emoji} Leaderboard`)
    //         .addOptions(selectOptions)
    // )
}

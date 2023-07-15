import {
    ActionRowBuilder,
    AnyComponentBuilder,
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} from 'discord.js'
import Embed from '../types/Embed'
import { Leaderboard } from '../sequelize/types/leaderboard'
import { Tracker } from '../sequelize/types/tracker'
import { avatarDisplayName } from '../config/discord'

export default class LeaderboardEmbed implements Embed {
    public getEmbed({
        leaderboard,
        trackers,
        selectedTracker
    }: {
        leaderboard: Leaderboard
        trackers: Tracker[]
        selectedTracker?: string
    }): EmbedBuilder {
        const tracker = this.getTracker(trackers, selectedTracker)
        const embed = new EmbedBuilder()
            .setTitle('Leaderboard') // TODO: allow setting leaderboard names
            .setAuthor({
                name: avatarDisplayName
            })
            .setColor('Gold')
            .setDescription(
                `${
                    !tracker
                        ? 'There are no trackers assigned to this leaderboard.'
                        : `Displaying statistics for ${tracker.name}.`
                }`
            )
            .setTimestamp()
            .setFooter({
                text: `ref: ${leaderboard.uuid}${
                    tracker ? ` | ${tracker.uuid}` : ''
                }`
            })
            .setThumbnail(
                'https://badgeos.org/wp-content/uploads/edd/2013/11/leaderboard.png' // TODO: Support custom tracker icons
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

    public getComponents = ({
        leaderboard,
        trackers,
        selectedTracker
    }: {
        leaderboard: Leaderboard
        trackers: Tracker[]
        selectedTracker?: string
    }): ActionRowBuilder<AnyComponentBuilder> => {
        const defaultTracker = this.getTracker(trackers, selectedTracker)

        const trackerOptions = trackers.map(tracker =>
            new StringSelectMenuOptionBuilder()
                .setLabel(tracker.name ?? `${tracker.uuid}`) // TODO: require a tracker name
                .setEmoji('⭐') // TODO: make tracker create command ask for a display emoji
                .setValue(tracker.uuid)
                .setDefault(
                    defaultTracker
                        ? defaultTracker.uuid === tracker.uuid
                        : false
                )
        )

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`leaderboardSelect:${leaderboard.uuid}`)
            .setPlaceholder('Select a Tracker')
            .setMaxValues(1)
            .setMinValues(1)
            .setOptions(trackerOptions)

        return new ActionRowBuilder().addComponents(selectMenu)
    }

    private getTracker = (
        trackers: Tracker[],
        selectedTracker?: string
    ): Tracker | undefined => {
        const sortedTrackers = trackers.sort()
        let tracker: Tracker | undefined = sortedTrackers[0]

        if (selectedTracker) {
            tracker = sortedTrackers.find(
                sortedTracker => sortedTracker.uuid === selectedTracker
            )
        }

        return tracker
    }
}

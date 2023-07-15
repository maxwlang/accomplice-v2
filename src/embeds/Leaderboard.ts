import {
    ActionRowBuilder,
    AnyComponentBuilder,
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    bold,
    formatEmoji,
    inlineCode
} from 'discord.js'
import Embed from '../types/Embed'
import { Leaderboard } from '../sequelize/types/leaderboard'
import { Tracker } from '../sequelize/types/tracker'
import { avatarDisplayName } from '../config/discord'
import { ReactionType } from '../sequelize/types/reaction'
import { titleCase } from '../util/strings'

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

        if (!tracker) return this.noTrackerEmbed(leaderboard)
        return this.leaderboardEmbed(leaderboard, tracker)
    }

    public getComponents = ({
        leaderboard,
        trackers,
        selectedTracker
    }: {
        leaderboard: Leaderboard
        trackers: Tracker[]
        selectedTracker?: string
    }): ActionRowBuilder<AnyComponentBuilder>[] | undefined => {
        const defaultTracker = this.getTracker(trackers, selectedTracker)
        if (!defaultTracker) return

        const trackerOptions = trackers.map(tracker => {
            let trackerEmoji = '📊' // Chart emoji
            if (
                tracker.reactionContent &&
                tracker.reactionType === ReactionType.Emoji
            ) {
                trackerEmoji = tracker.reactionContent
            }

            return new StringSelectMenuOptionBuilder()
                .setLabel(titleCase(tracker.name))
                .setEmoji(trackerEmoji)
                .setValue(tracker.uuid)
                .setDefault(
                    defaultTracker
                        ? defaultTracker.uuid === tracker.uuid
                        : false
                )
        })

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`leaderboardSelect:${leaderboard.uuid}`)
            .setPlaceholder('Select a Tracker')
            .setMaxValues(1)
            .setMinValues(1)
            .setOptions(trackerOptions)

        return [new ActionRowBuilder().addComponents(selectMenu)]
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

    private noTrackerEmbed = (leaderboard: Leaderboard): EmbedBuilder => {
        return new EmbedBuilder()
            .setTitle('Leaderboard')
            .setAuthor({
                name: avatarDisplayName
            })
            .setColor('Grey')
            .setDescription(
                `${bold(
                    'Not tracking anything yet!'
                )}\n\nThere are no trackers assigned to this leaderboard, use the ${inlineCode(
                    '/leaderboard track'
                )} command to add some!`
            )
            .setTimestamp()
            .setFooter({
                text: `ref: ${leaderboard.uuid}`
            })
            .setThumbnail(
                'https://badgeos.org/wp-content/uploads/edd/2013/11/leaderboard.png'
            )
    }

    private leaderboardEmbed = (
        leaderboard: Leaderboard,
        tracker: Tracker
    ): EmbedBuilder => {
        let displayEmoji = '📊'

        if (tracker.reactionContent) {
            switch (tracker.reactionType) {
                case ReactionType.Emoji:
                    displayEmoji = tracker.reactionContent
                    break
                case ReactionType.Custom:
                    displayEmoji = formatEmoji(tracker.reactionContent)
                    break
                case ReactionType.CustomGIF:
                    displayEmoji = formatEmoji(tracker.reactionContent, true)
            }
        }

        const embed = new EmbedBuilder()
            .setTitle(
                `${displayEmoji} ${titleCase(tracker.name)} - Leaderboard`
            )
            .setAuthor({
                name: avatarDisplayName
            })
            .setColor('Gold')
            .setTimestamp()
            .setFooter({
                text: `ref: ${leaderboard.uuid} | ${tracker.uuid}`
            })
            .setThumbnail(
                tracker.imageUrl
                    ? tracker.imageUrl
                    : 'https://badgeos.org/wp-content/uploads/edd/2013/11/leaderboard.png'
            )
            .setDescription(
                `Displaying top ${tracker.length} ${displayEmoji} earners.`
            )

        // embed.addFields({
        //     name: `${i + 1}. ${user.username}`,
        //     value: `${visualEmoji} - ${leaderboard[i].total}`,
        //     inline: true
        // })
        return embed
    }
}

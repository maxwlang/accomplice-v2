import Embed from '../types/Embed'
import { Leaderboard } from '../sequelize/types/leaderboard'
import { Tracker } from '../sequelize/types/tracker'
import { avatarDisplayName } from '../config/discord'
import { titleCase } from '../util/strings'

import {
    ActionRowBuilder,
    AnyComponentBuilder,
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    bold,
    formatEmoji,
    inlineCode,
    userMention
} from 'discord.js'
import { ReactionCount, ReactionType } from '../sequelize/types/reaction'

export default class LeaderboardEmbed implements Embed {
    public getEmbed({
        leaderboard,
        trackers,
        trackerReactions,
        selectedTrackerId
    }: {
        leaderboard: Leaderboard
        trackers: Tracker[]
        trackerReactions: Map<string, ReactionCount[]>
        selectedTrackerId?: string
    }): EmbedBuilder {
        const tracker = this.getTracker(trackers, selectedTrackerId)

        if (!tracker) return this.noTrackerEmbed(leaderboard)
        return this.leaderboardEmbed(leaderboard, tracker, trackerReactions)
    }

    public getComponents = ({
        leaderboard,
        trackers,
        selectedTrackerId
    }: {
        leaderboard: Leaderboard
        trackers: Tracker[]
        selectedTrackerId?: string
    }): ActionRowBuilder<AnyComponentBuilder>[] => {
        const defaultTracker = this.getTracker(trackers, selectedTrackerId)
        if (!defaultTracker) return []

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
        selectedTrackerId?: string
    ): Tracker | undefined => {
        const sortedTrackers = trackers.sort()
        let tracker: Tracker | undefined = sortedTrackers[0]

        if (selectedTrackerId) {
            tracker = sortedTrackers.find(
                sortedTracker => sortedTracker.uuid === selectedTrackerId
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
        tracker: Tracker,
        trackerReactions: Map<string, ReactionCount[]>
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

        const reactions = trackerReactions.get(tracker.uuid)
        if (!reactions || reactions.length === 0) {
            embed.setDescription(
                `Nobody has been reacted with ${displayEmoji}..`
            )

            return embed
        }

        embed.setDescription(
            `Displaying up to the top ${tracker.length} ${displayEmoji} earners.`
        )

        let i = 1
        for (const reaction of reactions) {
            embed.addFields({
                name: `${this.nth(i)}.`,
                value: `${userMention(
                    reaction.reacteeUserSnowflake
                )}\n${displayEmoji} - ${reaction.amount}`,
                inline: true
            })
            i++
        }

        return embed
    }

    // https://stackoverflow.com/a/39466341
    private nth(n: number): string {
        return `${n}${
            ['st', 'nd', 'rd'][((((n + 90) % 100) - 10) % 10) - 1] || 'th'
        }`
    }
}

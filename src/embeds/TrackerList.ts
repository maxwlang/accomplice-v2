import Embed from '../types/Embed'
import { ReactionType } from '../sequelize/types/reaction'
import { Tracker } from '../sequelize/types/tracker'
import { avatarDisplayName } from '../config/discord'
import { isEmpty } from 'ramda'

import { EmbedBuilder, bold, formatEmoji, inlineCode } from 'discord.js'

export default class TrackerList implements Embed {
    public getEmbed({ trackers }: { trackers: Tracker[] }): EmbedBuilder {
        const embed = new EmbedBuilder()
            .setTitle('Trackers')
            .setColor('Blue')
            .setTimestamp()
            .setFooter({
                text: `Powered By ${avatarDisplayName}`
            })

        if (!trackers || isEmpty(trackers)) {
            return embed
                .setColor('Orange')
                .setDescription(
                    'There are no trackers configured for this guild'
                )
        } else {
            // TODO: Clean this up, make the embed look better
            return embed.setDescription(
                `This guild has ${trackers.length} ${
                    trackers.length === 1 ? 'tracker' : 'trackers'
                }.\n\n${bold('Guild Trackers:')}\n${trackers
                    .map(tracker => {
                        return `- ${
                            tracker.name
                                ? `${tracker.name}`
                                : `${
                                      tracker.reactionType ===
                                      ReactionType.Emoji
                                          ? `${tracker.reactionContent} Tracker`
                                          : 'Custom Tracker'
                                  } `
                        }\n- - ID: ${inlineCode(
                            tracker.uuid
                        )}\n- - Reaction: ${this.mapReaction(tracker)}
                        \n- - Leaderboard Size: ${tracker.length} Users`
                    })
                    .join('\n\n')}`
            )
        }
    }

    private mapReaction(tracker: Tracker): string {
        let reaction = 'Unavailable'

        switch (tracker.reactionType) {
            case ReactionType.Emoji: {
                if (tracker.reactionContent) {
                    reaction = tracker.reactionContent
                }
                break
            }

            case ReactionType.Custom:
            case ReactionType.CustomGIF: {
                if (tracker.reactionContent) {
                    reaction = formatEmoji(
                        tracker.reactionContent,
                        tracker.reactionType === ReactionType.CustomGIF
                    )
                }

                break
            }
        }

        return reaction
    }

    // TODO: Let's use a select component here so we can choose trackers instead of listing all.
    public getComponents = (): null => null
}

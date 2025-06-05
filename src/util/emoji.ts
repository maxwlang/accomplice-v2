import { ReactionType } from '../sequelize/types/reaction'
import emojilib from 'emojilib'

import { GuildEmoji, ReactionEmoji } from 'discord.js'

export function getEmojiType(
    reaction: GuildEmoji | ReactionEmoji
): ReactionType | undefined {
    if (reaction.id === null) return ReactionType.Emoji
    if (reaction.animated) return ReactionType.CustomGIF
    if (reaction.id) return ReactionType.Custom
}

export const hasEmoji = (emoji: string): boolean =>
    Object.keys(emojilib).find(key => key === emoji) !== undefined

export const normalizeEmoji = (emoji: string): string =>
    Array.from(emoji)
        .map(cp => cp.codePointAt(0)?.toString(16))
        .filter(Boolean)
        .join('-')

export const denormalizeEmoji = (normalized: string): string =>
    String.fromCodePoint(
        ...normalized
            .split('-')
            .map(p => parseInt(p, 16))
    )

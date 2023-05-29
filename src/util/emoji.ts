import { GuildEmoji, ReactionEmoji } from 'discord.js'
import { ReactionType } from '../sequelize/types/reaction'

export function getEmojiType(
    reaction: GuildEmoji | ReactionEmoji
): ReactionType | undefined {
    if (reaction.id) return ReactionType.Custom
    if (reaction.id && reaction.animated) return ReactionType.CustomGIF
    if (reaction.id === null) return ReactionType.Emoji
}

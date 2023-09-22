import { ReactionType } from './reaction'

export interface Tracker {
    // The unique guid of the tracker
    uuid: string

    // The uuid for the guild, links with uuid on the Guild table
    guildId: string

    // The tracker display name
    name: string

    // An optional image url to display
    imageUrl: string | null

    // The amount of entries to display on the leaderboard
    length: number

    // Below are tracker options. At least one of them is required.
    // For tracking by: The kind of reaction
    reactionType: ReactionType | null

    // Should bots be included in the leaderboard?
    displayBots: boolean

    // Should users who have left the guild be included in the leaderboard?
    displayMissingUsers: boolean

    // For tracking by: The content in the reaction, ex: snowflake or 😊
    reactionContent: string | null

    // Should the tracker count reactions where a user reacted to their own message?
    recognizeSelfReactions: boolean

    // Should the tracker count reactions where a bot reacted to a message?
    recognizeBotReactions: boolean

    // TODO:
    // For tracking by: The user who received the reaction
    // reacteeUserId: string | null

    // For tracking by: The user who reacted to the message
    // reactorUserId: string | null
}

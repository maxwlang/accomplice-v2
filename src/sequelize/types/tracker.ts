import { ReactionType } from './reaction'

export type uuid = string

export interface Tracker {
    // The unique guid of the tracker
    uuid: string

    // The uuid for the guild, links with uuid on the Guild table
    guildId: uuid

    // The tracker display name
    name: string | null

    // The amount of entries to display on the leaderboard
    length: number

    // Below are tracker options. At least one of them is required.
    // For tracking by: The kind of reaction
    reactionType: ReactionType | null

    // For tracking by: The content in the reaction, ex: snowflake or 😊
    reactionContent: string | null

    // For tracking by: The user who received the reaction
    reacteeUserId: string | null

    // For tracking by: The user who reacted to the message
    reactorUserId: string | null
}

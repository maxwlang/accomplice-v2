import { ReactionType } from './reaction'

export type uuid = string

export interface Tracker {
    // The unique guid of the tracker
    uuid: string

    // The tracker display name, unique per-guild
    name: string | null

    // The amount of entries to display on the leaderboard
    maxEntries: number

    // Below are tracker options. At least one of them is required.
    // The kind of reaction
    reactionType: ReactionType | null

    // The content in the reaction, ex: :customEmote: or 😊
    reactionContent: string | null

    // The user who received the reaction
    reacteeUserId: string | null

    // The user who reacted to the message
    reactorUserId: string | null
}

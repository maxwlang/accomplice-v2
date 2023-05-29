export type uuid = string

export interface Leaderboard {
    // A unique guid for the leaderboard
    uuid: uuid

    // The uuid for the guild, links with uuid on the Guild table
    guildId: uuid

    // The channel snowflake for the leaderboard
    channel: string
}

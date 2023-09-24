export interface Leaderboard {
    // A unique guid for the leaderboard
    uuid: string

    // The uuid for the guild, links with uuid on the Guild table
    guildId: string

    // The snowflake of the leaderboard embed message
    messageSnowflake: string | null

    // The channel snowflake for the leaderboard
    channelSnowflake: string

    // Determines if Accomplice should delete messages in the leaderboard's channel
    deleteUserMessages: boolean

    // The default tracker for the leaderboard
    defaultLeaderboardTrackerId: string | null
}

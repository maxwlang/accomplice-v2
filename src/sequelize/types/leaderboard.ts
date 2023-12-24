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

    // How long in seconds before the embed is set back to the default tracker. Minimum 120 seconds.
    defaultTrackerTimeout: number

    // The default tracker for the leaderboard
    defaultLeaderboardTrackerId: string | null
}

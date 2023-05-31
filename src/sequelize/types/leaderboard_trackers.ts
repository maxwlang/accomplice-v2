export type uuid = string

export interface LeaderboardTrackers {
    // A unique guid for the leaderboard tracker
    uuid: uuid

    // The uuid for the guild, links with uuid on the Guild table
    guildId: uuid

    // The uuid for the leaderboard this tracker associates with, links with uuid on the Leaderboard table
    leaderboardId: uuid

    // The uuid for the tracker. Links with uuid on the Tracker table
    trackerId: uuid
}

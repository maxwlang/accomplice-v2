export enum GuildSyncState {
    Unsynced = 'unsynced',
    Syncing = 'syncing',
    Synced = 'synced',
    Errored = 'errored'
}

export interface Guild {
    // A unique guid for the guild
    uuid: string

    // The guild's snowflake
    snowflake: string

    // A json object representing the guild's command state
    commandsState: [{ [k: string]: unknown }]

    // A json object representing the guild's command sync state
    channelsState: [{ [k: string]: unknown }]
    // [
    //     {
    //         [k: string]: {
    //             channelSnowflake: string
    //             latestMessageSnowflake: string
    //         }
    //     }
    // ]

    // If the guild should be prioritized over other guilds
    isPriority: boolean

    // The sync state of guild reactions
    syncState: GuildSyncState
}

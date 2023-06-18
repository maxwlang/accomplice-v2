export type uuid = string

export enum GuildSyncState {
    Unsynced = 'unsynced',
    Syncing = 'syncing',
    Synced = 'synced'
}

export interface Guild {
    // A unique guid for the guild
    uuid: uuid

    // The guild's snowflake
    snowflake: string

    // A json object representing the guild's command state
    commandsState: [{ [k: string]: unknown }]

    // If the guild should be prioritized over other guilds
    isPriority: boolean

    // The sync state of guild reactions
    syncState: GuildSyncState
}

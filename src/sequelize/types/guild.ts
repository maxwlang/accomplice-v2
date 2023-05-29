export type uuid = string

export interface Guild {
    // A unique guid for the guild
    uuid: uuid

    // The guild's snowflake
    snowflake: string

    // If the guild should be prioritized over other guilds
    isPriority: boolean
}

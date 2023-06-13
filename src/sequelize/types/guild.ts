export type uuid = string

export interface Guild {
    // A unique guid for the guild
    uuid: uuid

    // The guild's snowflake
    snowflake: string

    // A json object representing the guild's command state
    commandsState: [{ [k: string]: unknown }]

    // If the guild should be prioritized over other guilds
    isPriority: boolean
}

export type uuid = string

export interface GuildUsers {
    // A unique guid for the Guild User
    uuid: uuid

    // The guild this user lives
    guildId: uuid

    // The user
    userId: uuid
}

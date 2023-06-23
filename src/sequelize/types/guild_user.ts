export type uuid = string

export interface GuildUser {
    // A unique guid for the Guild User
    uuid: uuid

    // The guild this user lives
    guildId: uuid

    // The user
    userId: uuid
}

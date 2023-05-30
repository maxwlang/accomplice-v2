export type uuid = string

export enum ReactionType {
    Emoji = 'emoji',
    Custom = 'custom',
    CustomGIF = 'customGif',
    CustomSuper = 'customSuper',
    CustomSuperGif = 'customSuperGif'
}

export interface Reaction {
    // A unique guid for the reaction event
    uuid: uuid

    // The uuid for the guild, links with uuid on the Guild table
    guildId: uuid

    // The type of reaction
    type: ReactionType

    // The reaction name or unicode emoji character
    content: string

    // The ID of the emoji
    emojiId: string | null

    // The snowflake for the reacted message
    messageSnowflake: string

    // The user who has received the reaction
    reacteeUserId: uuid

    // The user who has reacted
    reactorUserId: uuid
}

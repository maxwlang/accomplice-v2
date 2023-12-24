export interface Starboard {
    // A unique guid for the starboard
    uuid: string

    // The guilds unique id, links with uuid on Guilds table
    guildId: string

    // An optional name for the starboard set by the user
    name: string | null

    // The starboard channel snowflake
    channelSnowflake: string

    // An optional channel snowflake to monitor for reacts. Ignores all other channels when set
    monitorChannelSnowflake: string | null

    // Toggles if bot reacts should count
    allowBotReacts: boolean

    // Toggles if reacted bots should appear on the starboard
    allowReactedBots: boolean

    // A minimum number of reacts to be put on the starboard
    minimumReacts: number

    // A minimum number of react removals to be removed from the starboard
    removalThreshold: number

    // What was this?
    react: string
}

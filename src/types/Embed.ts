import { ComponentBuilder, EmbedBuilder } from 'discord.js'

export default interface Embed {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getEmbed: (args?: any) => Promise<EmbedBuilder> | EmbedBuilder
    getComponents: (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args?: any
    ) => Promise<ComponentBuilder> | ComponentBuilder | null
}

import { EmbedBuilder } from 'discord.js'

export default interface Embed {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getEmbed: <T>(args?: T | any) => Promise<EmbedBuilder> | EmbedBuilder
}

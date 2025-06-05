import { ColorResolvable, EmbedBuilder } from 'discord.js'
import { avatarDisplayName } from '../config/discord'
import Embed from '../types/Embed'

export default class SimpleEmbed implements Embed {
    private description: string
    private title?: string
    private color: ColorResolvable

    constructor(
        description: string,
        options?: { title?: string; color?: ColorResolvable }
    ) {
        this.description = description
        this.title = options?.title
        this.color = options?.color ?? 'Blue'
    }

    public getEmbed(): EmbedBuilder {
        const embed = new EmbedBuilder()
            .setDescription(this.description)
            .setColor(this.color)
            .setTimestamp()
            .setFooter({ text: `Powered By ${avatarDisplayName}` })

        if (this.title) embed.setTitle(this.title)
        return embed
    }

    public getComponents = (): null => null
}

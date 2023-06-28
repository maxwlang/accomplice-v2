import { EmbedBuilder, bold, inlineCode } from 'discord.js'
import Embed from '../types/Embed'
import { avatarDisplayName } from '../config/discord'

export default class Welcome implements Embed {
    public getEmbed(avatarUrl: string | undefined | null): EmbedBuilder {
        let embed = new EmbedBuilder()
            .setTitle('Hello There!')
            .setDescription(
                `${bold(
                    `Thank you for inviting ${avatarDisplayName} into your guild!`
                )}\n\n${avatarDisplayName} is currently indexing all the message reactions in your guild, this task can take several hours depending on the amount of messages, and you'll be notified once it is completed.\n\n${avatarDisplayName} is also attempting to register slash commands to your guild.. a ✅ react will appear here if this succeeds. If this fails, ${avatarDisplayName} will react with ❌ and provide an explanation.\n\n${bold(
                    'Meanwhile..'
                )} to use ${avatarDisplayName}'s slash commands, type ${inlineCode(
                    '/'
                )} in the chat bar following any of ${avatarDisplayName} commands. If you would like a list of ${avatarDisplayName}'s commands, click it's profile picture located on the left hand side of the popup when you type ${inlineCode(
                    '/'
                )}.`
            )
            .setColor('Gold')
            .setFooter({ text: `Thank you for using ${avatarDisplayName}!` })
            .setTimestamp()

        if (avatarUrl) {
            embed = embed.setThumbnail(avatarUrl)
        }

        return embed
    }

    public getComponents = (): null => null
}

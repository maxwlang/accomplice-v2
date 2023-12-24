import Embed from '../types/Embed'
import { EmbedBuilder } from 'discord.js'
import { avatarDisplayName } from '../config/discord'

export default class CommandsRegistered implements Embed {
    public getEmbed(): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle('Commands Registered')
            .setColor('Green')
            .setTimestamp()
            .setDescription(
                `Hey there! ${avatarDisplayName} was able to successfully register slash commands to your guild. You may now use ${avatarDisplayName}, thank you for your patience.`
            )
            .setThumbnail('https://i.imgur.com/uxwU2lb.png')
    }

    public getComponents = (): null => null
}

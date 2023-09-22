import Embed from '../types/Embed'
import { avatarDisplayName } from '../config/discord'

import { EmbedBuilder, bold } from 'discord.js'

export default class ApplicationCommandRateLimit implements Embed {
    public getEmbed(): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle('Rate Limited')
            .setColor('Red')
            .setTimestamp()
            .setDescription(
                `Hey there! Unfortunately, it looks like Discord has decided to rate limit ${avatarDisplayName}'s ability to register slash commands to your guild! [Discord allows bots 200 slash commands registered per day and we appear to have hit our limit.](https://discord.com/developers/docs/interactions/application-commands#registering-a-command)\n\nThis should be resolved within at most ${bold(
                    'about a day'
                )} if you keep ${avatarDisplayName} in your guild, but ${bold(
                    "we'll try and register commands every 15 minutes and update you if they register successfully"
                )}. ${avatarDisplayName} will also continue indexing your guild's reacts during this time.\n\nSorry for the inconvenience.`
            )
            .setThumbnail('https://i.imgur.com/96xyDZS.png')
    }

    public getComponents = (): null => null
}

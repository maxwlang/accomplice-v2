import {
    ChatInputCommandInteraction,
    OAuth2Scopes,
    PermissionFlagsBits,
    SlashCommandBuilder
} from 'discord.js'
import Command from '../types/Command'
import Accomplice from '../accomplice'

export default class PingCommand implements Command {
    public meta = new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Gets a bot invite link')

    public execute = async ({
        interaction,
        bot
    }: {
        interaction: ChatInputCommandInteraction
        bot: Accomplice
    }): Promise<void> => {
        const link = bot.generateInvite({
            permissions: [
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.SendMessagesInThreads,
                PermissionFlagsBits.AddReactions,
                PermissionFlagsBits.EmbedLinks,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.UseApplicationCommands,
                PermissionFlagsBits.UseExternalEmojis,
                PermissionFlagsBits.ViewChannel
            ],
            scopes: [OAuth2Scopes.Bot]
        })
        await interaction.reply(
            `You may invite the bot to other guilds using the following link: ${link}`
        )
        return
    }
}

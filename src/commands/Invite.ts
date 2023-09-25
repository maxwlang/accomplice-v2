import Accomplice from '../accomplice'
import Command from '../types/Command'

import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import { requiredPermissions, requiredScopes } from '../config/discord'

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
            permissions: requiredPermissions,
            scopes: requiredScopes
        })
        await interaction.reply(
            `You may invite the bot to other guilds using the following link: ${link}`
        )
        return
    }
}

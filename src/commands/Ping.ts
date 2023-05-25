import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import Command from '../types/Command'

export default class PingCommand implements Command {
    public meta = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pings the bot')

    public execute = async ({
        interaction
    }: {
        interaction: ChatInputCommandInteraction
    }): Promise<void> => {
        await interaction.reply('Pong!')
        return
    }
}

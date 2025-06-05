import Command from '../types/Command'

import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import SimpleEmbed from '../embeds/SimpleEmbed'

export default class PingCommand implements Command {
    public meta = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pings the bot')

    public execute = async ({
        interaction
    }: {
        interaction: ChatInputCommandInteraction
    }): Promise<void> => {
        const embed = new SimpleEmbed('Pong!', { title: 'Pong', color: 'Green' })
            .getEmbed()
        await interaction.reply({ embeds: [embed] })
    }
}

import Command from '../types/Command'

import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import SimpleEmbed from '../embeds/SimpleEmbed'

export default class PriorityCommand implements Command {
    public meta = new SlashCommandBuilder()
        .setName('priority')
        .setDescription('Configures guild priority')
        .addSubcommand(subCommand =>
            subCommand
                .setName('add')
                .setDescription('Adds a guild to the priority guild list')
        )
        .addSubcommand(subCommand =>
            subCommand
                .setName('remove')
                .setDescription('Removes a guild to the priority guild list')
        )
        .addSubcommand(subCommand =>
            subCommand
                .setName('list')
                .setDescription('Shows the priority guild list')
        )

    public execute = async ({
        interaction
    }: {
        interaction: ChatInputCommandInteraction
    }): Promise<void> => {
        const embed = new SimpleEmbed('Pong!', {
            title: 'Pong',
            color: 'Green'
        }).getEmbed()
        await interaction.reply({ embeds: [embed] })
    }
}

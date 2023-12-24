import Command from '../types/Command'

import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'

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
        await interaction.reply('Pong!')
        return
    }
}

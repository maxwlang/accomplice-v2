import Command from '../types/Command'

import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import SimpleEmbed from '../embeds/SimpleEmbed'

export default class StarboardCommand implements Command {
    // Should be admin perms
    public meta = new SlashCommandBuilder()
        .setName('starboard')
        .setDescription('Creates a starboard that monitors the guild.')
        .addSubcommand(subCommand =>
            subCommand
                .setName('add')
                .setDescription('Adds a starboard')
                .addChannelOption(option =>
                    option
                        .setName('board-channel')
                        .setDescription(
                            'The channel where the board will reside'
                        )
                        .setRequired(true)
                )
                .addBooleanOption(option =>
                    option
                        .setName('allow-bot-reactions')
                        .setDescription('Should bot reactions count')
                        .setRequired(true)
                )
                .addBooleanOption(option =>
                    option
                        .setName('allow-reacted-bots')
                        .setDescription('Should reacted bots show on the board')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('minimum-reacts')
                        .setDescription(
                            'The minimum reacts required to show on the board'
                        )
                        .setMinValue(1)
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('react')
                        .setDescription('The reaction to watch for')
                        .setRequired(true)
                )
                .addChannelOption(option =>
                    option
                        .setName('monitor-channel')
                        .setDescription(
                            'The channel to watch for reactions. Searches guild when not set.'
                        )
                )
                .addIntegerOption(option =>
                    option
                        .setName('removal-threshold')
                        .setDescription(
                            'When set, the amount of reacts that must be lost to be removed from the board'
                        )
                        .setMinValue(1)
                )
                .addStringOption(option =>
                    option
                        .setName('id')
                        .setDescription('An optional unique starboard id')
                        .setMaxLength(32)
                )
        )
        .addSubcommand(subCommand =>
            subCommand
                .setName('update')
                .setDescription('Updates a starboard configuration')
                .addStringOption(option =>
                    option
                        .setName('starboard')
                        .setDescription('The ID of the starboard')
                        .setRequired(true)
                )
                .addChannelOption(option =>
                    option
                        .setName('board-channel')
                        .setDescription(
                            'The channel where the board will reside'
                        )
                )
                .addChannelOption(option =>
                    option
                        .setName('monitor-channel')
                        .setDescription(
                            'The channel to watch for reactions. Searches guild when not set.'
                        )
                )
                .addBooleanOption(option =>
                    option
                        .setName('allow-bot-reactions')
                        .setDescription('Should bot reactions count')
                )
                .addBooleanOption(option =>
                    option
                        .setName('allow-reacted-bots')
                        .setDescription('Should reacted bots show on the board')
                )
                .addStringOption(option =>
                    option
                        .setName('react')
                        .setDescription('The reaction to watch for')
                )
                .addIntegerOption(option =>
                    option
                        .setName('minimum-reacts')
                        .setDescription(
                            'The minimum reacts required to show on the board'
                        )
                        .setMinValue(1)
                )
                .addIntegerOption(option =>
                    option
                        .setName('removal-threshold')
                        .setDescription(
                            'When set, the amount of reacts that must be lost to be removed from the board'
                        )
                        .setMinValue(1)
                )
        )
        .addSubcommand(subCommand =>
            subCommand
                .setName('delete')
                .setDescription('Deletes a starboard')
                .addStringOption(option =>
                    option
                        .setName('starboard')
                        .setDescription('The ID of the starboard')
                        .setRequired(true)
                )
        )
        .addSubcommand(subCommand =>
            subCommand
                .setName('list')
                .setDescription('Lists available starboards')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription(
                            'List only starboards in a specific channel'
                        )
                )
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

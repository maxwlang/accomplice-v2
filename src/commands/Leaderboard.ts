import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import Command from '../types/Command'

export default class LeaderboardCommand implements Command {
    // Should be admin perms
    public meta = new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Creates a leaderboard that monitors the guild.')
        .addSubcommand(subCommand =>
            subCommand
                .setName('create')
                .setDescription('Create a leaderboard in a channel')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription(
                            'The channel where the leaderboard embed will live'
                        )
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('id')
                        .setDescription('An optional unique leaderboard id')
                        .setMaxLength(32)
                )
        )
        .addSubcommand(subCommand =>
            subCommand
                .setName('track')
                .setDescription(
                    'Starts tracking a new react on the leaderboard'
                )
                .addStringOption(option =>
                    option
                        .setName('leaderboard')
                        .setDescription('The leaderboard id')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('reaction')
                        .setDescription(
                            'The reaction to start tracking (emoji, custom emote)'
                        )
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription(
                            'An optional statistic name associated with the react'
                        )
                        .setMaxLength(32)
                )
        )
        .addSubcommand(subCommand =>
            subCommand
                .setName('untrack')
                .setDescription('Stops tracking a react on the leaderboard')
                .addStringOption(option =>
                    option
                        .setName('leaderboard')
                        .setDescription('The leaderboard id')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('reaction')
                        .setDescription(
                            'The reaction to stop tracking (emoji, custom emote)'
                        )
                        .setRequired(true)
                )
        )
        .addSubcommand(subCommand =>
            subCommand
                .setName('list')
                .setDescription('Lists available leaderboards')
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

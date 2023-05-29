import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import Command from '../types/Command'
import Accomplice from '../accomplice'
import LeaderboardList from '../embeds/LeaderboardList'

export default class LeaderboardCommand implements Command {
    // Should be admin perms
    public meta = new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Creates a leaderboard that monitors the guild.')
        // Leaderboard - create
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
        // Leaderboard - track
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
        // Leaderboard - untrack
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
        // Leaderboard - list
        .addSubcommand(subCommand =>
            subCommand
                .setName('list')
                .setDescription('Lists available leaderboards')
        )
        // Leaderboard - synchronize
        .addSubcommand(subCommand =>
            subCommand
                .setName('synchronize')
                .setDescription(
                    'Re-synchronizes all message history for the guild.'
                )
                .addBooleanOption(option =>
                    option
                        .setName('confirm')
                        .setDescription(
                            'This will take a while and disable leaderboard during synchronization'
                        )
                )
        )

    public execute = async ({
        bot,
        interaction
    }: {
        bot: Accomplice
        interaction: ChatInputCommandInteraction
    }): Promise<void> => {
        switch (interaction.options.getSubcommand()) {
            case 'list':
                await this.listLeaderboard(bot, interaction)
                break

            case 'synchronize':
                await this.leaderboardSync(bot, interaction)
                break

            default:
                await interaction.reply('Unhandled subcommand supplied')
        }
    }

    private async listLeaderboard(
        bot: Accomplice,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const { Guild, Leaderboard } = bot.sequelize.models
        const guildRow = await Guild.findOne({
            where: { snowflake: interaction.guildId }
        })

        if (guildRow === null || !guildRow) {
            bot.logger.error(`Failed to locate guild in database`)
            await interaction.reply(
                'An error has occured, please try again later'
            )

            return
        }

        const leaderboards = await Leaderboard.findAll({
            where: {
                guildId: guildRow.uuid
            }
        })

        const leaderboardListEmbed = new LeaderboardList().getEmbed()

        await interaction.editReply(leaderboardListEmbed)

        console.log({ leaderboards })

        await interaction.reply('ayo bruh')
    }

    private async leaderboardSync(
        bot: Accomplice,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        if (!interaction.guildId || interaction.guildId === null) {
            bot.logger.error('Could not find guild id during leaderboard sync')
            await interaction.reply(
                'An error has occured, please try again later'
            )
            return
        }

        await interaction.reply(
            'You have started a leaderboard synchronization. During this time, leaderboards for this guild will be unavailable.'
        )

        bot.synchronizeGuilds(interaction.guildId, interaction)
    }
}

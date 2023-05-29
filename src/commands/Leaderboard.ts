import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    channelMention,
    inlineCode
} from 'discord.js'
import Command from '../types/Command'
import Accomplice from '../accomplice'
import LeaderboardList from '../embeds/LeaderboardList'
import { Leaderboard } from '../sequelize/types/leaderboard'
import { Guild } from '../sequelize/types/guild'
import { v4 as uuidv4 } from 'uuid'

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
        )
        // Leaderboard - remove
        .addSubcommand(subCommand =>
            subCommand
                .setName('remove')
                .setDescription('Removes a leaderboard from a channel')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription(
                            'The channel you wish to remove the leaderboard from'
                        )
                        .setRequired(true)
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
            case 'create':
                await this.createLeaderboard(bot, interaction)
                break

            case 'remove':
                await this.removeLeaderboard(bot, interaction)
                break

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

    private async createLeaderboard(
        bot: Accomplice,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const { Guild, Leaderboard } = bot.sequelize.models
        const guildRow: Guild | null = await Guild.findOne({
            where: { snowflake: interaction.guildId }
        })

        if (guildRow === null || !guildRow) {
            bot.logger.error('Failed to locate guild in database')
            await interaction.reply(
                'An error has occured, please try again later'
            )

            return
        }

        const channel = interaction.options.getChannel('channel')
        if (channel === null) {
            bot.logger.error('Failed to resolve channel option')
            await interaction.reply(
                'An error occured while locating the channel for the leaderboard'
            )

            return
        }

        const [leaderboard, created]: [Leaderboard, boolean] =
            await Leaderboard.findOrCreate({
                where: {
                    guildId: guildRow.uuid,
                    channel: channel.id
                },
                defaults: {
                    uuid: uuidv4(),
                    guildId: guildRow.uuid,
                    channel: channel.id
                }
            })

        if (leaderboard !== null && leaderboard !== undefined && !created) {
            await interaction.reply(
                `A leaderboard already exists in ${channelMention(
                    channel.id
                )}. If you would like to track additional statistics on this leaderboard please use the ${inlineCode(
                    '/leaderboard track'
                )} command.`
            )
        } else {
            await interaction.reply(
                `A leaderboard has been created in ${channelMention(
                    channel.id
                )}. You may use the ${inlineCode(
                    '/leaderboard track'
                )} command to add tracked statistics, and the ${inlineCode(
                    '/leaderboard untrack'
                )} command to remove tracked statistics.`
            )
        }
    }

    private async removeLeaderboard(
        bot: Accomplice,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const { Guild, Leaderboard, LeaderboardTrackers } = bot.sequelize.models
        const guildRow: Guild | null = await Guild.findOne({
            where: { snowflake: interaction.guildId }
        })

        if (guildRow === null || !guildRow) {
            bot.logger.error('Failed to locate guild in database')
            await interaction.reply(
                'An error has occured, please try again later'
            )

            return
        }

        const channel = interaction.options.getChannel('channel')
        if (channel === null) {
            bot.logger.error('Failed to resolve channel option')
            await interaction.reply(
                'An error occured while locating the channel for the leaderboard'
            )

            return
        }

        const leaderboard: Leaderboard | null = await Leaderboard.findOne({
            where: {
                guildId: guildRow.uuid,
                channel: channel.id
            }
        })

        if (!leaderboard || leaderboard === null) {
            await interaction.reply(
                `The channel ${channelMention(
                    channel.id
                )} does not currently have a leaderboard associated with it. If you would like to add a leaderboard please use the ${inlineCode(
                    '/leaderboard create'
                )} command.`
            )
            return
        }

        await Leaderboard.destroy({
            where: {
                uuid: leaderboard.uuid
            }
        })

        await LeaderboardTrackers.destroy({
            where: {
                leaderboardId: leaderboard.uuid
            }
        })

        await interaction.reply(
            `The leaderboard associated with the channel ${channelMention(
                channel.id
            )} has been removed.`
        )
    }

    private async listLeaderboard(
        bot: Accomplice,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const { Guild, Leaderboard } = bot.sequelize.models
        const guildRow: Guild = await Guild.findOne({
            where: { snowflake: interaction.guildId }
        })

        if (guildRow === null || !guildRow) {
            bot.logger.error(`Failed to locate guild in database`)
            await interaction.reply(
                'An error has occured, please try again later'
            )

            return
        }

        const leaderboards: Leaderboard[] = await Leaderboard.findAll({
            where: {
                guildId: guildRow.uuid
            }
        })

        const leaderboardListEmbed = new LeaderboardList().getEmbed(
            leaderboards
        )

        await interaction.reply({
            embeds: [leaderboardListEmbed]
        })
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

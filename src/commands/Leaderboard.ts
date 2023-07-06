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
import { Tracker } from '../sequelize/types/tracker'
import { v4 as uuidv4 } from 'uuid'
import { LeaderboardTrackers } from '../sequelize/types/leaderboard_trackers'
import TrackerList from '../embeds/TrackerList'
import { isEmpty } from 'ramda'
// import { Tracker } from '../sequelize/types/tracker'

export default class LeaderboardCommand implements Command {
    // Should be admin perms
    public meta = new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Creates a leaderboard that monitors the guild')
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
        // Leaderboard - destroy
        .addSubcommand(subCommand =>
            subCommand
                .setName('destroy')
                .setDescription('Removes a leaderboard from a channel')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription(
                            'The channel you wish to remove the leaderboard from'
                        )
                        .setRequired(true)
                )
                .addBooleanOption(option =>
                    option
                        .setName('confirm')
                        .setRequired(true)
                        .setDescription(
                            'This will permanently remove the leaderboard from the guild'
                        )
                )
        )
        // Leaderboard - track
        .addSubcommand(subCommand =>
            subCommand
                .setName('track')
                .setDescription('Adds a tracker to the supplied leaderboard')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription(
                            "The channel with the leaderboard you'd like to add a tracker to"
                        )
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('tracker-id')
                        .setDescription(
                            'The id of the tracker to add (/leaderboard trackers to view them)'
                        )
                        .setRequired(true)
                )
        )
        // Leaderboard - untrack
        .addSubcommand(subCommand =>
            subCommand
                .setName('untrack')
                .setDescription(
                    'Removes a tracker from the supplied leaderboard'
                )
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription(
                            "The channel with the leaderboard you'd like to remove a tracker from"
                        )
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('tracker-id')
                        .setDescription(
                            'The id of the tracker to remove (/leaderboard trackers to view them)'
                        )
                        .setRequired(true)
                )
        )
        // Leaderboard - trackers
        .addSubcommand(subCommand =>
            subCommand
                .setName('trackers')
                .setDescription('Lists trackers on a specific leaderboard')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription(
                            'List trackers assocated with this leaderboard'
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
                    'Re-synchronizes all message history for the guild'
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
            case 'create': // Done
                await this.createLeaderboard(bot, interaction)
                break

            case 'destroy': // Done
                await this.destroyLeaderboard(bot, interaction)
                break

            case 'trackers': // Done
                await this.listTrackers(bot, interaction)
                break

            case 'track': // Done
                await this.track(bot, interaction)
                break

            case 'untrack': // Done
                await this.untrack(bot, interaction)
                break

            case 'list': // Done
                await this.listLeaderboard(bot, interaction)
                break

            case 'synchronize': // TODO
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

        if (!guildRow || guildRow === null) {
            bot.logger.error('Failed to locate guild in database')
            await interaction.reply(
                'An error has occured, please try again later'
            )

            return
        }

        const channel = interaction.options.getChannel('channel')
        if (!channel || channel === null) {
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
                    channelSnowflake: channel.id
                },
                defaults: {
                    uuid: uuidv4(),
                    guildId: guildRow.uuid,
                    channelSnowflake: channel.id
                }
            })

        if (leaderboard && !created) {
            await interaction.reply(
                `A leaderboard already exists in ${channelMention(
                    channel.id
                )}. If you would like to track additional statistics on this leaderboard please use the ${inlineCode(
                    '/leaderboard track'
                )} command`
            )
        } else {
            await bot.createOrUpdateLeaderboardEmbed(leaderboard.uuid)

            await interaction.reply(
                `A leaderboard has been created in ${channelMention(
                    channel.id
                )}. You may use the ${inlineCode(
                    '/leaderboard track'
                )} command to add tracked statistics, and the ${inlineCode(
                    '/leaderboard untrack'
                )} command to remove tracked statistics`
            )
        }
    }

    private async destroyLeaderboard(
        bot: Accomplice,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const actionConfirm = interaction.options.getBoolean('confirm', true)
        if (!actionConfirm) {
            await interaction.reply(
                'Please confirm this destructive action using the `confirm` command argument'
            )

            return
        }

        const { Guild, Leaderboard, LeaderboardTrackers } = bot.sequelize.models
        const guildRow: Guild | null = await Guild.findOne({
            where: { snowflake: interaction.guildId }
        })

        if (!guildRow || guildRow === null) {
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
                channelSnowflake: channel.id
            }
        })

        if (!leaderboard || leaderboard === null) {
            await interaction.reply(
                `The channel ${channelMention(
                    channel.id
                )} does not currently have a leaderboard associated with it. If you would like to add a leaderboard please use the ${inlineCode(
                    '/leaderboard create'
                )} command`
            )
            return
        }

        await bot.createOrUpdateLeaderboardEmbed(leaderboard.uuid, true)

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

    private async listTrackers(
        bot: Accomplice,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const { Guild, Tracker, Leaderboard, LeaderboardTrackers } =
            bot.sequelize.models
        const guildRow: Guild | null = await Guild.findOne({
            where: { snowflake: interaction.guildId }
        })

        if (!guildRow || guildRow === null) {
            bot.logger.error(`Failed to locate guild in database`)
            await interaction.reply(
                'An error has occured, please try again later'
            )

            return
        }

        const trackers: Tracker[] = []
        const channelId = interaction.options.getChannel('channel', true).id
        // All trackers on channel
        const leaderboard: Leaderboard | null = await Leaderboard.findOne({
            where: {
                channelSnowflake: channelId
            }
        })

        if (!leaderboard) {
            await interaction.reply(
                'There is no leaderboard for the supplied channel'
            )
            return
        }

        const leaderboardTrackers: LeaderboardTrackers[] =
            await LeaderboardTrackers.findAll({
                where: {
                    guildId: guildRow.uuid,
                    leaderboardId: leaderboard.uuid
                }
            })

        if (isEmpty(leaderboardTrackers)) {
            await interaction.reply('There are no trackers on this leaderboard')
            return
        }

        for (const leaderboardTracker of leaderboardTrackers) {
            const tracker: Tracker | null = await Tracker.findOnce({
                where: {
                    guildId: guildRow.uuid,
                    uuid: leaderboardTracker.trackerId
                }
            })

            if (tracker) trackers.push(tracker)
        }

        const trackerListEmbed = new TrackerList().getEmbed({ trackers })

        await interaction.reply({
            embeds: [trackerListEmbed]
        })
    }

    private async track(
        bot: Accomplice,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const { Guild, Leaderboard, Tracker, LeaderboardTrackers } =
            bot.sequelize.models

        const guildRow: Guild | null = await Guild.findOne({
            where: { snowflake: interaction.guildId }
        })

        if (!guildRow || guildRow === null) {
            await interaction.reply(
                'An error has occured, please try again later'
            )

            return
        }
        const channel = await interaction.options.getChannel('channel', true)
        const leaderboard: Leaderboard = await Leaderboard.findOne({
            where: { channelSnowflake: channel.id, guildId: guildRow.uuid }
        })
        if (!leaderboard || leaderboard === null) {
            bot.logger.debug(`Failed to locate leaderboard in database`)
            await interaction.reply(
                'There is no leaderboard in the provided channel'
            )
            return
        }

        const trackerId = await interaction.options.getString(
            'tracker-id',
            true
        )
        const tracker: Tracker = await Tracker.findOne({
            where: { uuid: trackerId, guildId: guildRow.uuid }
        })
        if (!tracker || tracker === null) {
            bot.logger.debug('The requested tracker does not exist')
            await interaction.reply(
                'The tracker you have provided does not exist'
            )
            return
        }

        const [leaderboardTracker, created]: [LeaderboardTrackers, boolean] =
            await LeaderboardTrackers.findOrCreate({
                where: {
                    trackerId: tracker.uuid,
                    leaderboardId: leaderboard.uuid
                },
                defaults: {
                    uuid: uuidv4(),
                    guildId: guildRow.uuid,
                    leaderboardId: leaderboard.uuid,
                    trackerId: tracker.uuid
                }
            })

        if (!created) {
            await interaction.reply(
                'The tracker you have provided already exists on this leaderboard'
            )
            return
        }

        bot.logger.debug(
            `Created leaderboard tracker ${leaderboardTracker.uuid}`
        )

        await bot.createOrUpdateLeaderboardEmbed(leaderboard.uuid)
        await interaction.reply('The tracker has been added')
    }

    private async untrack(
        bot: Accomplice,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const { Guild, Leaderboard, Tracker, LeaderboardTrackers } =
            bot.sequelize.models

        const guildRow: Guild | null = await Guild.findOne({
            where: { snowflake: interaction.guildId }
        })

        if (!guildRow || guildRow === null) {
            await interaction.reply(
                'An error has occured, please try again later'
            )

            return
        }
        const channel = await interaction.options.getChannel('channel', true)
        const leaderboard: Leaderboard = await Leaderboard.findOne({
            where: { channelSnowflake: channel.id, guildId: guildRow.uuid }
        })
        if (!leaderboard || leaderboard === null) {
            bot.logger.debug(`Failed to locate leaderboard in database`)
            await interaction.reply(
                'There is no leaderboard in the provided channel'
            )
            return
        }

        const trackerId = await interaction.options.getString(
            'tracker-id',
            true
        )
        const tracker: Tracker = await Tracker.findOne({
            where: { uuid: trackerId, guildId: guildRow.uuid }
        })
        if (!tracker || tracker === null) {
            bot.logger.debug('The requested tracker does not exist')
            await interaction.reply(
                'The tracker you have provided does not exist'
            )
            return
        }

        const leaderboardTracker: LeaderboardTrackers =
            await LeaderboardTrackers.findOne({
                where: {
                    guildId: guildRow.uuid,
                    trackerId: tracker.uuid,
                    leaderboardId: leaderboard.uuid
                }
            })

        if (!leaderboardTracker || leaderboardTracker == null) {
            await interaction.reply('Unable to locate tracker on leaderboard')
            return
        }

        await LeaderboardTrackers.destroy({
            where: {
                uuid: leaderboardTracker.uuid
            }
        })

        await interaction.reply('The tracker has been removed')
        await bot.createOrUpdateLeaderboardEmbed(leaderboard.uuid)
    }

    private async listLeaderboard(
        bot: Accomplice,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const { Guild, Leaderboard } = bot.sequelize.models
        const guildRow: Guild = await Guild.findOne({
            where: { snowflake: interaction.guildId }
        })

        if (!guildRow || guildRow === null) {
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
            'You have started a leaderboard synchronization. During this time, leaderboards for this guild will be unavailable'
        )

        bot.prepareSynchronizeGuilds(interaction.guildId, interaction)
    }
}

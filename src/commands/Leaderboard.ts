import Accomplice from '../accomplice'
import Command from '../types/Command'
import { Guild } from '../sequelize/types/guild'
import { Leaderboard } from '../sequelize/types/leaderboard'
import LeaderboardList from '../embeds/LeaderboardList'
import { LeaderboardTrackers } from '../sequelize/types/leaderboard_trackers'
import { Tracker } from '../sequelize/types/tracker'
import TrackerList from '../embeds/TrackerList'
import { isEmpty } from 'ramda'
import { v4 as uuidv4 } from 'uuid'

import {
    ChatInputCommandInteraction,
    NonThreadGuildBasedChannel,
    SlashCommandBuilder,
    channelMention,
    inlineCode
} from 'discord.js'
import SimpleEmbed from '../embeds/SimpleEmbed'

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
                .addBooleanOption(option =>
                    option
                        .setName('delete-user-messages')
                        .setDescription(
                            'Should Accomplice delete user messages in the channel? (default: true)'
                        )
                        .setRequired(false)
                )
                .addIntegerOption(option =>
                    option
                        .setName('default-tracker-timeout')
                        .setDescription(
                            'The default tracker timeout in seconds (default: 120)'
                        )
                        .setRequired(false)
                        .setMinValue(120)
                        .setMaxValue(1800)
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
        // Leaderboard - update
        .addSubcommand(subCommand =>
            subCommand
                .setName('update')
                .setDescription('Updates a leaderboard configuration')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription(
                            'The channel where the leaderboard exists'
                        )
                        .setRequired(true)
                )
                .addBooleanOption(option =>
                    option
                        .setName('delete-user-messages')
                        .setDescription(
                            'Should Accomplice delete user messages in the channel?'
                        )
                )
                .addIntegerOption(option =>
                    option
                        .setName('default-tracker-timeout')
                        .setDescription(
                            'The default tracker timeout in seconds'
                        )
                        .setMinValue(120)
                        .setMaxValue(1800)
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
                .addBooleanOption(option =>
                    option
                        .setName('is-default')
                        .setDescription(
                            'Should this be the default tracker for the leaderboard?'
                        )
                        .setRequired(false)
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
                    'Re-synchronizes message history for a specific channel or the entire guild'
                )
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Channel to synchronize')
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

            case 'update':
                await this.updateLeaderboard(bot, interaction)
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
                await interaction.reply({
                    embeds: [
                        new SimpleEmbed('Unhandled subcommand supplied', {
                            color: 'Red',
                            title: 'Error'
                        }).getEmbed()
                    ]
                })
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
        const deleteUserMessages =
            interaction.options.getBoolean('delete-user-messages') ?? true

        if (!guildRow || guildRow === null) {
            bot.logger.error('Failed to locate guild in database')
            await interaction.reply({
                embeds: [
                    new SimpleEmbed(
                        'An error has occured, please try again later',
                        { color: 'Red', title: 'Error' }
                    ).getEmbed()
                ]
            })

            return
        }

        const channel = interaction.options.getChannel('channel', true)
        if (channel === null) {
            bot.logger.error('Failed to resolve channel option')
            await interaction.reply({
                embeds: [
                    new SimpleEmbed(
                        'An error occured while locating the channel for the leaderboard',
                        { color: 'Red', title: 'Error' }
                    ).getEmbed()
                ]
            })

            return
        }

        const defaultTrackerTimeout =
            interaction.options.getInteger('default-tracker-timeout') ?? 120

        const [leaderboard, created]: [Leaderboard, boolean] =
            await Leaderboard.findOrCreate({
                where: {
                    guildId: guildRow.uuid,
                    channelSnowflake: channel.id,
                    deleteUserMessages,
                    defaultTrackerTimeout
                },
                defaults: {
                    uuid: uuidv4(),
                    guildId: guildRow.uuid,
                    channelSnowflake: channel.id
                }
            })

        if (leaderboard && !created) {
            await interaction.reply({
                embeds: [
                    new SimpleEmbed(
                        `A leaderboard already exists in ${channelMention(
                            channel.id
                        )}. If you would like to track additional statistics on this leaderboard please use the ${inlineCode(
                            '/leaderboard track'
                        )} command`,
                        { title: 'Leaderboard Exists', color: 'Orange' }
                    ).getEmbed()
                ]
            })
        } else {
            await bot.createOrUpdateLeaderboardEmbed(leaderboard.uuid)

            await interaction.reply({
                embeds: [
                    new SimpleEmbed(
                        `A leaderboard has been created in ${channelMention(
                            channel.id
                        )}. You may use the ${inlineCode(
                            '/leaderboard track'
                        )} command to add tracked statistics, and the ${inlineCode(
                            '/leaderboard untrack'
                        )} command to remove tracked statistics`,
                        { title: 'Leaderboard Created', color: 'Green' }
                    ).getEmbed()
                ]
            })
        }
    }

    private async destroyLeaderboard(
        bot: Accomplice,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const actionConfirm = interaction.options.getBoolean('confirm', true)
        if (!actionConfirm) {
            await interaction.reply({
                embeds: [
                    new SimpleEmbed(
                        'Please confirm this destructive action by setting the `confirm` command argument to true',
                        { color: 'Orange', title: 'Confirmation Required' }
                    ).getEmbed()
                ]
            })

            return
        }

        const { Guild, Leaderboard, LeaderboardTrackers } = bot.sequelize.models
        const guildRow: Guild | null = await Guild.findOne({
            where: { snowflake: interaction.guildId }
        })

        if (!guildRow || guildRow === null) {
            bot.logger.error('Failed to locate guild in database')
            await interaction.reply({
                embeds: [
                    new SimpleEmbed(
                        'An error has occured, please try again later',
                        {
                            color: 'Red',
                            title: 'Error'
                        }
                    ).getEmbed()
                ]
            })

            return
        }

        const channel = interaction.options.getChannel('channel', true)
        if (channel === null) {
            bot.logger.error('Failed to resolve channel option')
            await interaction.reply({
                embeds: [
                    new SimpleEmbed(
                        'An error occured while locating the channel for the leaderboard',
                        { color: 'Red', title: 'Error' }
                    ).getEmbed()
                ]
            })

            return
        }

        const leaderboard: Leaderboard | null = await Leaderboard.findOne({
            where: {
                guildId: guildRow.uuid,
                channelSnowflake: channel.id
            }
        })

        if (!leaderboard || leaderboard === null) {
            await interaction.reply({
                embeds: [
                    new SimpleEmbed(
                        `The channel ${channelMention(
                            channel.id
                        )} does not currently have a leaderboard associated with it. If you would like to add a leaderboard please use the ${inlineCode(
                            '/leaderboard create'
                        )} command`,
                        { color: 'Orange', title: 'Leaderboard Missing' }
                    ).getEmbed()
                ]
            })
            return
        }

        await bot.createOrUpdateLeaderboardEmbed(
            leaderboard.uuid,
            undefined,
            true
        )

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

        await interaction.reply({
            embeds: [
                new SimpleEmbed(
                    `The leaderboard associated with the channel ${channelMention(
                        channel.id
                    )} has been removed.`,
                    { title: 'Leaderboard Removed', color: 'Green' }
                ).getEmbed()
            ]
        })
    }

    private async updateLeaderboard(
        bot: Accomplice,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const { Guild, Leaderboard } = bot.sequelize.models
        const guildRow: Guild | null = await Guild.findOne({
            where: { snowflake: interaction.guildId }
        })

        if (!guildRow) {
            bot.logger.error('Failed to locate guild in database')
            await interaction.reply({
                embeds: [
                    new SimpleEmbed('An error has occured, please try again later', {
                        color: 'Red',
                        title: 'Error'
                    }).getEmbed()
                ]
            })

            return
        }

        const channel = interaction.options.getChannel('channel', true)
        if (!channel) {
            bot.logger.error('Failed to resolve channel option')
            await interaction.reply({
                embeds: [
                    new SimpleEmbed(
                        'An error occured while locating the channel for the leaderboard',
                        { color: 'Red', title: 'Error' }
                    ).getEmbed()
                ]
            })
            return
        }

        const leaderboard: Leaderboard | null = await Leaderboard.findOne({
            where: { guildId: guildRow.uuid, channelSnowflake: channel.id }
        })

        if (!leaderboard) {
            await interaction.reply({
                embeds: [
                    new SimpleEmbed(
                        `The channel ${channelMention(
                            channel.id
                        )} does not currently have a leaderboard associated with it. If you would like to add a leaderboard please use the ${inlineCode(
                            '/leaderboard create'
                        )} command`,
                        { color: 'Orange', title: 'Leaderboard Missing' }
                    ).getEmbed()
                ]
            })
            return
        }

        const deleteUserMessages = interaction.options.getBoolean(
            'delete-user-messages'
        )
        const defaultTrackerTimeout = interaction.options.getInteger(
            'default-tracker-timeout'
        )

        const updates: Partial<Leaderboard> = {}
        if (deleteUserMessages !== null) updates.deleteUserMessages = deleteUserMessages
        if (defaultTrackerTimeout !== null)
            updates.defaultTrackerTimeout = defaultTrackerTimeout

        if (Object.keys(updates).length === 0) {
            await interaction.reply({
                embeds: [
                    new SimpleEmbed('No update options were supplied', {
                        color: 'Orange',
                        title: 'Nothing To Update'
                    }).getEmbed()
                ]
            })
            return
        }

        await Leaderboard.update(updates, { where: { uuid: leaderboard.uuid } })

        await bot.createOrUpdateLeaderboardEmbed(leaderboard.uuid)

        await interaction.reply({
            embeds: [
                new SimpleEmbed('The leaderboard has been updated', {
                    color: 'Green',
                    title: 'Leaderboard Updated'
                }).getEmbed()
            ]
        })
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
            await interaction.reply({
                embeds: [
                    new SimpleEmbed(
                        'An error has occured, please try again later',
                        {
                            color: 'Red',
                            title: 'Error'
                        }
                    ).getEmbed()
                ]
            })

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
            await interaction.reply({
                embeds: [
                    new SimpleEmbed(
                        'There is no leaderboard for the supplied channel',
                        { color: 'Orange', title: 'Leaderboard Missing' }
                    ).getEmbed()
                ]
            })
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
            await interaction.reply({
                embeds: [
                    new SimpleEmbed(
                        'There are no trackers on this leaderboard',
                        {
                            color: 'Orange',
                            title: 'No Trackers'
                        }
                    ).getEmbed()
                ]
            })
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
            await interaction.reply({
                embeds: [
                    new SimpleEmbed(
                        'An error has occured, please try again later',
                        {
                            color: 'Red',
                            title: 'Error'
                        }
                    ).getEmbed()
                ]
            })

            return
        }
        const channel = await interaction.options.getChannel('channel', true)
        const isDefault =
            (await interaction.options.getBoolean('is-default')) ?? false

        const leaderboard: Leaderboard = await Leaderboard.findOne({
            where: { channelSnowflake: channel.id, guildId: guildRow.uuid }
        })
        if (!leaderboard || leaderboard === null) {
            bot.logger.debug(`Failed to locate leaderboard in database`)
            await interaction.reply({
                embeds: [
                    new SimpleEmbed(
                        'There is no leaderboard in the provided channel',
                        {
                            color: 'Orange',
                            title: 'Leaderboard Missing'
                        }
                    ).getEmbed()
                ]
            })
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
            await interaction.reply({
                embeds: [
                    new SimpleEmbed(
                        'The tracker you have provided does not exist',
                        {
                            color: 'Red',
                            title: 'Tracker Missing'
                        }
                    ).getEmbed()
                ]
            })
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

        if (isDefault || leaderboard.defaultLeaderboardTrackerId === null) {
            await Leaderboard.update(
                { defaultLeaderboardTrackerId: leaderboardTracker.uuid },
                {
                    where: {
                        uuid: leaderboard.uuid
                    }
                }
            )
        }

        if (!created) {
            await interaction.reply({
                embeds: [
                    new SimpleEmbed(
                        'The tracker you have provided already exists on this leaderboard',
                        { color: 'Orange', title: 'Tracker Exists' }
                    ).getEmbed()
                ]
            })
            return
        }

        bot.logger.debug(
            `Created leaderboard tracker ${leaderboardTracker.uuid}`
        )

        await bot.createOrUpdateLeaderboardEmbed(leaderboard.uuid)
        await interaction.reply({
            embeds: [
                new SimpleEmbed('The tracker has been added', {
                    color: 'Green',
                    title: 'Tracker Added'
                }).getEmbed()
            ]
        })
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
            await interaction.reply({
                embeds: [
                    new SimpleEmbed('Unable to locate tracker on leaderboard', {
                        color: 'Red',
                        title: 'Tracker Missing'
                    }).getEmbed()
                ]
            })
            return
        }

        await LeaderboardTrackers.destroy({
            where: {
                uuid: leaderboardTracker.uuid
            }
        })

        if (
            leaderboard.defaultLeaderboardTrackerId === leaderboardTracker.uuid
        ) {
            await Leaderboard.update(
                { defaultLeaderboardTrackerId: null },
                {
                    where: {
                        uuid: leaderboard.uuid
                    }
                }
            )

            let newDefaultTrackerId: string | null = null
            if (
                (await LeaderboardTrackers.count({
                    where: {
                        leaderboardId: leaderboard.uuid
                    }
                })) >= 1
            ) {
                // TODO: It would be nice if we could spawn an embed here to select the new default tracker
                const newDefaultTracker = await LeaderboardTrackers.findOne({
                    where: {
                        leaderboardId: leaderboard.uuid
                    },
                    order: [['createdAt', 'ASC']]
                })
                newDefaultTrackerId = newDefaultTracker?.uuid ?? null
            }

            await Leaderboard.update(
                { defaultLeaderboardTrackerId: newDefaultTrackerId },
                {
                    where: {
                        uuid: leaderboard.uuid
                    }
                }
            )
        }

        await interaction.reply({
            embeds: [
                new SimpleEmbed('The tracker has been removed', {
                    color: 'Green',
                    title: 'Tracker Removed'
                }).getEmbed()
            ]
        })
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
        if (!interaction.guildId) {
            bot.logger.error('Could not find guild id during leaderboard sync')
            await interaction.reply(
                'An error has occured, please try again later'
            )
            return
        }

        const channel = interaction.options.getChannel(
            'channel'
        ) as NonThreadGuildBasedChannel | null

        if (channel) {
            if (!channel.isTextBased()) {
                await interaction.reply({
                    embeds: [
                        new SimpleEmbed('Please provide a valid text channel', {
                            color: 'Red',
                            title: 'Invalid Channel'
                        }).getEmbed()
                    ]
                })
                return
            }

            await interaction.reply({
                embeds: [
                    new SimpleEmbed(
                        `Started leaderboard synchronization for ${channel}`,
                        { title: 'Synchronization Started', color: 'Blue' }
                    ).getEmbed()
                ]
            })

            await bot.synchronizeChannel(channel, interaction)
            return
        }

        const confirm = interaction.options.getBoolean('confirm') ?? false

        if (!confirm) {
            await interaction.reply({
                embeds: [
                    new SimpleEmbed(
                        'Confirmation required to resync entire guild',
                        {
                            color: 'Orange',
                            title: 'Confirmation Required'
                        }
                    ).getEmbed()
                ]
            })
            return
        }

        await interaction.reply({
            embeds: [
                new SimpleEmbed(
                    'You have started a leaderboard synchronization. During this time, leaderboards for this guild will be unavailable',
                    { title: 'Synchronization Started', color: 'Blue' }
                ).getEmbed()
            ]
        })

        bot.prepareSynchronizeGuilds(interaction.guildId, interaction)
    }
}

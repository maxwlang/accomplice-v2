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
import { ReactionType } from '../sequelize/types/reaction'
import { hasEmoji } from '../util/emoji'
import { LeaderboardTrackers } from '../sequelize/types/leaderboard_trackers'
import TrackerList from '../embeds/TrackerList'
import { isEmpty } from 'ramda'
// import { Tracker } from '../sequelize/types/tracker'

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
                            'This will permanently remove the leaderboard from the guild.'
                        )
                )
        )
        // Leaderboard - tracker-create
        .addSubcommand(subCommand =>
            subCommand
                .setName('tracker-create')
                .setDescription(
                    'Creates a tracker that can be added to leaderboards'
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
                .addIntegerOption(option =>
                    option
                        .setName('length')
                        .setDescription(
                            'How many entries to show on the leaderboard. Default: 10'
                        )
                        .setMinValue(1)
                )
        )
        // Leaderboard - tracker-destroy
        .addSubcommand(subCommand =>
            subCommand
                .setName('tracker-destroy')
                .setDescription(
                    'Removed a tracker from the guild and all leaderboards'
                )
                .addStringOption(option =>
                    option
                        .setName('id')
                        .setDescription(
                            'The tracker id. Find it with /leaderboard trackers'
                        )
                        .setRequired(true)
                )
                .addBooleanOption(option =>
                    option
                        .setName('confirm')
                        .setDescription(
                            'This will remove the tracker from all leaderboards on the guild.'
                        )
                        .setRequired(true)
                )
        )
        // Leaderboard - track
        .addSubcommand(subCommand =>
            subCommand
                .setName('track')
                .setDescription('Adds a tracker to the supplied leaderboard')
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
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription(
                            "The channel with the leaderboard you'd like to add a tracker to"
                        )
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
                        .setName('reaction')
                        .setDescription(
                            'The reaction to stop tracking (emoji, custom emote)'
                        )
                        .setRequired(true)
                )
        )
        // Leaderboard - trackers
        .addSubcommand(subCommand =>
            subCommand
                .setName('trackers')
                .setDescription(
                    'Lists trackers on the guild or a specific leaderboard'
                )
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription(
                            'List trackers assocated with this leaderboard'
                        )
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
            case 'create': // Done
                await this.createLeaderboard(bot, interaction)
                break

            case 'destroy': // Done
                await this.destroyLeaderboard(bot, interaction)
                break

            case 'tracker-create': // Done
                await this.createTracker(bot, interaction)
                break

            case 'tracker-destroy': // Done
                await this.destroyTracker(bot, interaction)
                break

            case 'trackers': // TODO
                await this.listTrackers(bot, interaction)
                break

            case 'track': // TODO
                await this.track(bot, interaction)
                break

            case 'untrack': // TODO
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

        if (leaderboard !== null && leaderboard !== undefined && !created) {
            await interaction.reply(
                `A leaderboard already exists in ${channelMention(
                    channel.id
                )}. If you would like to track additional statistics on this leaderboard please use the ${inlineCode(
                    '/leaderboard track'
                )} command.`
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
                )} command to remove tracked statistics.`
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
                'Please confirm this destructive action using the `confirm` command argument.'
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
                )} command.`
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

    private async createTracker(
        bot: Accomplice,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const { Tracker, Guild } = bot.sequelize.models

        const reaction = interaction.options.getString('reaction')
        const displayName = interaction.options.getString('name')
        const trackerLength = interaction.options.getInteger('length') ?? 9

        // We shouldn't hit this, but for type safety & sanity we'll check it
        if (!reaction || reaction === null) {
            bot.logger.debug('No reaction supplied, will not create tracker')
            await interaction.reply('Please supply a reaction to track')
            return
        }

        if (displayName && displayName.length > 32) {
            bot.logger.debug(
                'Display name is too long, will not create tracker'
            )
            await interaction.reply(
                `The name you specified ${inlineCode(
                    displayName
                )} is over the 32 character name limit. Please correct this and try again.`
            )
            return
        }

        const emoteRegex = /(<a?)?:\w+:(\d+)?/g
        const guildEmojiNumbers = emoteRegex.exec(reaction)?.[2]
        const isRegularEmoji = hasEmoji(reaction)
        let reactionType: ReactionType | undefined
        let reactionContent: string | undefined

        if (isRegularEmoji) {
            reactionType = ReactionType.Emoji
            reactionContent = reaction
        } else if (guildEmojiNumbers) {
            console.log(guildEmojiNumbers)
            const guildEmoji = bot.emojis.cache.get(guildEmojiNumbers)
            console.log(guildEmoji)
            if (guildEmoji) {
                reactionType = ReactionType.Custom
                if (guildEmoji.animated) ReactionType.CustomGIF
                reactionContent = guildEmoji.id
            } else {
                bot.logger.error('Failed to parse discord emoji')
                await interaction.reply(
                    'An issue occured while trying to parse the supplied reaction. Please rename it or try another one. When using custom emotes, for now you must only use emotes available on this server.'
                )
                return
            }
        } else {
            bot.logger.error('Unknown content supplied as reaction')
            await interaction.reply(
                'The reaction you have supplied is unsupported. Please try another one'
            )
            return
        }

        const guild: Guild = await Guild.findOne({
            where: { snowflake: interaction.guildId }
        })

        if (!guild || guild === null) {
            bot.logger.error("Couldn't locate guild")
            await interaction.reply(
                'An error occured while trying to lookup your guild. Please try again later.'
            )
            return
        }

        const [tracker, created]: [Tracker, boolean] =
            await Tracker.findOrCreate({
                where: {
                    guildId: guild.uuid,
                    name: displayName,
                    reactionType,
                    reactionContent
                },
                defaults: {
                    uuid: uuidv4(),
                    guildId: guild.uuid,
                    name: displayName,
                    length: trackerLength,
                    reactionType,
                    reactionContent
                }
            })

        if (created) {
            // TODO: Make these embeds
            await interaction.reply(
                `Your tracker has been created with identifier ${inlineCode(
                    tracker.uuid
                )}${
                    displayName
                        ? ` and display name ${inlineCode(displayName)}.`
                        : '.'
                } To view trackers available to this guild, use the ${inlineCode(
                    '/leaderboard trackers'
                )} command. If you'd like to use this tracker, use the ${inlineCode(
                    '/leaderboard track'
                )} command. For example ${inlineCode(
                    `/leaderboard track channel:"#Rules" tracker:"${tracker.uuid}"`
                )}`
            )
        } else {
            bot.logger.debug('Tracker already exists')
            await interaction.reply(
                `The tracker you are trying to create already exists. To view trackers available to this guild, use the ${inlineCode(
                    '/leaderboard trackers'
                )} command. If you'd like to use this tracker, use the ${inlineCode(
                    '/leaderboard track'
                )} command. For example ${inlineCode(
                    `/leaderboard track channel:"#Rules" tracker:"${tracker.uuid}"`
                )}`
            )
        }
    }

    private async destroyTracker(
        bot: Accomplice,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const actionConfirm = interaction.options.getBoolean('confirm', true)
        if (!actionConfirm) {
            await interaction.reply(
                'Please confirm this destructive action using the `confirm` command argument.'
            )

            return
        }

        const { Guild, LeaderboardTrackers, Tracker } = bot.sequelize.models
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

        const trackerId = interaction.options.getString('id', true)

        const tracker: Tracker | null = await Tracker.findOne({
            where: {
                uuid: trackerId,
                guildId: guildRow.uuid
            }
        })

        if (!tracker || tracker === null) {
            await interaction.reply(
                `The tracker ${channelMention(
                    trackerId
                )} does not exist. If you would like to add a tracker please use the ${inlineCode(
                    '/leaderboard tracker-create'
                )} command.`
            )
            return
        }

        await Tracker.destroy({
            where: {
                uuid: tracker.uuid
            }
        })

        const leaderboardTrackerLinks: LeaderboardTrackers[] =
            await LeaderboardTrackers.findAll({
                where: {
                    trackerId: tracker.uuid
                }
            })

        await LeaderboardTrackers.destroy({
            where: {
                trackerId: tracker.uuid
            }
        })

        // Update any embeds to reflect new changes
        for (const leaderboardTrackerLink of leaderboardTrackerLinks) {
            await bot.createOrUpdateLeaderboardEmbed(
                leaderboardTrackerLink.leaderboardId
            )
        }

        await interaction.reply(
            `The tracker ${inlineCode(tracker.uuid)} has been destroyed.`
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

        let trackers: Tracker[] = []
        const extraArgs = {}
        const channelId = interaction.options.getChannel('channel')?.id
        if (channelId) {
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
                await interaction.reply(
                    'There are no trackers on this leaderboard'
                )
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
        } else {
            // All guild trackers
            trackers = await Tracker.findAll({
                where: {
                    guildId: guildRow.uuid,
                    ...extraArgs
                }
            })
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
        const { Leaderboard, Tracker } = bot.sequelize.models
        const channel = await interaction.options.getChannel('channel')
        if (!channel || channel === null) {
            bot.logger.error('Failed to resolve channel option')
            await interaction.reply(
                'An error occured while locating the channel for the leaderboard'
            )
            return
        }
        const leaderboard: Leaderboard = await Leaderboard.findOne({
            where: { channelSnowflake: channel.id }
        })
        if (!leaderboard || leaderboard === null) {
            bot.logger.error(`Failed to locate guild in database`)
            await interaction.reply(
                'An error has occured, please try again later'
            )
            return
        }

        // find a tracker by uuid passed in
        const trackerId = await interaction.options.getString('tracker-id')
        const tracker: Tracker = await Tracker.findOne({
            where: { channelSnowflake: channel.id }
        })
        if (tracker !== null) {
            bot.logger.debug(
                'The requested tracker already exists, will not create'
            )
            await interaction.reply(
                'The tracker you have tried to create already exists on this leaderboard. Please track a different react, or track this react on a different leaderboard.'
            )
            return
        }
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
            'You have started a leaderboard synchronization. During this time, leaderboards for this guild will be unavailable.'
        )

        bot.synchronizeGuilds(interaction.guildId, interaction)
    }
}

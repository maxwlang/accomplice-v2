import Accomplice from '../accomplice'
import Command from '../types/Command'
import { Guild } from '../sequelize/types/guild'
import { LeaderboardTrackers } from '../sequelize/types/leaderboard_trackers'
import { ReactionType } from '../sequelize/types/reaction'
import { Tracker } from '../sequelize/types/tracker'
import TrackerList from '../embeds/TrackerList'
import { hasEmoji, normalizeEmoji } from '../util/emoji'
import { v4 as uuidv4 } from 'uuid'

import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    channelMention,
    inlineCode
} from 'discord.js'
import SimpleEmbed from '../embeds/SimpleEmbed'

export default class LeaderboardCommand implements Command {
    // Should be admin perms
    public meta = new SlashCommandBuilder()
        .setName('tracker')
        .setDescription('Creates trackers for use on leaderboards')
        // tracker - create
        .addSubcommand(subCommand =>
            subCommand
                .setName('create')
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
                            'A name associated with the tracker, displayed on leaderboard'
                        )
                        .setMaxLength(32)
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('length')
                        .setDescription(
                            'How many entries to show on the leaderboard (Default: 10)'
                        )
                        .setMinValue(1)
                )
                .addBooleanOption(option =>
                    option
                        .setName('display-bots')
                        .setDescription(
                            'Should bots be displayed on the leaderboard (Default: false)'
                        )
                        .setRequired(false)
                )
                .addBooleanOption(option =>
                    option
                        .setName('display-missing-users')
                        .setDescription(
                            'Should users who have left the server be displayed on the leaderboard (Default: false)'
                        )
                        .setRequired(false)
                )
                .addBooleanOption(option =>
                    option
                        .setName('recognize-self-reactions')
                        .setDescription(
                            'Should this tracker count a user who reacts to their own message (Default: false)'
                        )
                        .setRequired(false)
                )
                .addBooleanOption(option =>
                    option
                        .setName('recognize-bot-reactions')
                        .setDescription(
                            'Should this tracker count a bot who reacts to a message (Default: false)'
                        )
                        .setRequired(false)
                )
        )
        // tracker - destroy
        .addSubcommand(subCommand =>
            subCommand
                .setName('destroy')
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
                            'This will remove the tracker from all leaderboards on the guild'
                        )
                        .setRequired(true)
                )
        )
        // tracker - list
        .addSubcommand(subCommand =>
            subCommand
                .setName('list')
                .setDescription('Lists trackers on the guild')
        )
        // tracker - update
        .addSubcommand(subCommand =>
            subCommand
                .setName('update')
                .setDescription('Updates an existing tracker')
                .addStringOption(option =>
                    option
                        .setName('id')
                        .setDescription('The tracker id to update')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('reaction')
                        .setDescription('The reaction to track (emoji or custom emote)')
                )
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('A name associated with the tracker')
                        .setMaxLength(32)
                )
                .addIntegerOption(option =>
                    option
                        .setName('length')
                        .setDescription('How many entries to show on the leaderboard')
                        .setMinValue(1)
                )
                .addBooleanOption(option =>
                    option
                        .setName('display-bots')
                        .setDescription('Should bots be displayed on the leaderboard')
                )
                .addBooleanOption(option =>
                    option
                        .setName('display-missing-users')
                        .setDescription('Should users who left the server be displayed')
                )
                .addBooleanOption(option =>
                    option
                        .setName('recognize-self-reactions')
                        .setDescription('Should self reactions be counted')
                )
                .addBooleanOption(option =>
                    option
                        .setName('recognize-bot-reactions')
                        .setDescription('Should bot reactions be counted')
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
                await this.createTracker(bot, interaction)
                break

            case 'destroy': // Done
                await this.destroyTracker(bot, interaction)
                break

            case 'list': // Done
                await this.listTrackers(bot, interaction)
                break

            case 'update':
                await this.updateTracker(bot, interaction)
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

    private async createTracker(
        bot: Accomplice,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const { Tracker, Guild } = bot.sequelize.models

        const reaction = interaction.options.getString('reaction', true)
        const displayName = interaction.options.getString('name', true)
        const trackerLength = interaction.options.getInteger('length') ?? 9
        const displayBots =
            interaction.options.getBoolean('display-bots') ?? false
        const displayMissingUsers =
            interaction.options.getBoolean('display-missing-users') ?? false
        const recognizeSelfReactions =
            interaction.options.getBoolean('recognize-self-reactions') ?? false
        const recognizeBotReactions =
            interaction.options.getBoolean('recognize-bot-reactions') ?? false

        if (displayName && displayName.length > 32) {
            bot.logger.debug(
                'Display name is too long, will not create tracker'
            )
            await interaction.reply({
                embeds: [
                    new SimpleEmbed(
                        `The name you specified ${inlineCode(
                            displayName
                        )} is over the 32 character name limit. Please correct this and try again`,
                        { color: 'Red', title: 'Invalid Name' }
                    ).getEmbed()
                ]
            })
            return
        }

        const emoteRegex = /(<a?)?:\w+:(\d+)?/g
        const guildEmojiNumbers = emoteRegex.exec(reaction)?.[2]
        const isRegularEmoji = hasEmoji(reaction)
        let reactionType: ReactionType | undefined
        let reactionContent: string | undefined

        if (isRegularEmoji) {
            reactionType = ReactionType.Emoji
            reactionContent = normalizeEmoji(reaction)
        } else if (guildEmojiNumbers) {
            const guildEmoji = bot.emojis.cache.get(guildEmojiNumbers)
            if (guildEmoji) {
                reactionType = guildEmoji.animated
                    ? ReactionType.CustomGIF
                    : ReactionType.Custom
                reactionContent = guildEmoji.id
            } else {
                bot.logger.error('Failed to parse discord emoji')
                await interaction.reply({
                    embeds: [
                        new SimpleEmbed(
                            'An issue occured while trying to parse the supplied reaction. Please rename it or try another one. When using custom emotes, for now you must only use emotes available on this server',
                            { color: 'Red', title: 'Error' }
                        ).getEmbed()
                    ]
                })
                return
            }
        } else {
            bot.logger.error('Unknown content supplied as reaction')
            await interaction.reply({
                embeds: [
                    new SimpleEmbed(
                        'The reaction you have supplied is unsupported. Please try another one',
                        { color: 'Red', title: 'Error' }
                    ).getEmbed()
                ]
            })
            return
        }

        const guild: Guild = await Guild.findOne({
            where: { snowflake: interaction.guildId }
        })

        if (!guild || guild === null) {
            bot.logger.error("Couldn't locate guild")
            await interaction.reply({
                embeds: [
                    new SimpleEmbed(
                        'An error occured while trying to lookup your guild. Please try again later',
                        { color: 'Red', title: 'Error' }
                    ).getEmbed()
                ]
            })
            return
        }

        const [tracker, created]: [Tracker, boolean] =
            await Tracker.findOrCreate({
                where: {
                    guildId: guild.uuid,
                    name: displayName,
                    reactionType,
                    reactionContent,
                    displayBots,
                    displayMissingUsers,
                    recognizeSelfReactions,
                    recognizeBotReactions
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
            await interaction.reply({
                embeds: [
                    new SimpleEmbed(
                        `Your tracker has been created with identifier ${inlineCode(
                            tracker.uuid
                        )}${
                            displayName
                                ? ` and display name ${inlineCode(
                                      displayName
                                  )}.`
                                : '.'
                        } To view trackers available to this guild, use the ${inlineCode(
                            '/leaderboard trackers'
                        )} command. If you'd like to use this tracker, use the ${inlineCode(
                            '/leaderboard track'
                        )} command. For example ${inlineCode(
                            `/leaderboard track channel:"#Rules" tracker:"${tracker.uuid}"`
                        )}`,
                        { title: 'Tracker Created', color: 'Green' }
                    ).getEmbed()
                ]
            })
        } else {
            bot.logger.debug('Tracker already exists')
            await interaction.reply({
                embeds: [
                    new SimpleEmbed(
                        `The tracker you are trying to create already exists. To view trackers available to this guild, use the ${inlineCode(
                            '/leaderboard trackers'
                        )} command. If you'd like to use this tracker, use the ${inlineCode(
                            '/leaderboard track'
                        )} command. For example ${inlineCode(
                            `/leaderboard track channel:"#Rules" tracker:"${tracker.uuid}"`
                        )}`,
                        { title: 'Tracker Exists', color: 'Orange' }
                    ).getEmbed()
                ]
            })
        }
    }

    private async destroyTracker(
        bot: Accomplice,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const actionConfirm = interaction.options.getBoolean('confirm', true)
        if (actionConfirm !== true) {
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

        const { Guild, LeaderboardTrackers, Tracker, Leaderboard } =
            bot.sequelize.models
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

        const trackerId = interaction.options.getString('id', true)

        const tracker: Tracker | null = await Tracker.findOne({
            where: {
                uuid: trackerId,
                guildId: guildRow.uuid
            }
        })

        if (!tracker || tracker === null) {
            await interaction.reply({
                embeds: [
                    new SimpleEmbed(
                        `The tracker ${channelMention(
                            trackerId
                        )} does not exist. If you would like to add a tracker please use the ${inlineCode(
                            '/leaderboard tracker-create'
                        )} command`,
                        { title: 'Tracker Missing', color: 'Red' }
                    ).getEmbed()
                ]
            })
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
            await Leaderboard.update({
                defaultLeaderboardTrackerId: null,
                where: {
                    defaultLeaderboardTrackerId: leaderboardTrackerLink.uuid
                }
            })

            await bot.createOrUpdateLeaderboardEmbed(
                leaderboardTrackerLink.leaderboardId
            )
        }

        await interaction.reply({
            embeds: [
                new SimpleEmbed(
                    `The tracker ${inlineCode(
                        tracker.uuid
                    )} has been destroyed`,
                    { title: 'Tracker Destroyed', color: 'Green' }
                ).getEmbed()
            ]
        })
    }

    private async updateTracker(
        bot: Accomplice,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const { Guild, Tracker, LeaderboardTrackers } = bot.sequelize.models
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

        const trackerId = interaction.options.getString('id', true)
        const tracker: Tracker | null = await Tracker.findOne({
            where: { uuid: trackerId, guildId: guildRow.uuid }
        })

        if (!tracker) {
            await interaction.reply({
                embeds: [
                    new SimpleEmbed(
                        `The tracker ${inlineCode(
                            trackerId
                        )} does not exist. If you would like to add a tracker please use the ${inlineCode(
                            '/tracker create'
                        )} command`,
                        { title: 'Tracker Missing', color: 'Red' }
                    ).getEmbed()
                ]
            })
            return
        }

        const name = interaction.options.getString('name')
        const length = interaction.options.getInteger('length')
        const displayBots = interaction.options.getBoolean('display-bots')
        const displayMissingUsers = interaction.options.getBoolean('display-missing-users')
        const recognizeSelfReactions = interaction.options.getBoolean('recognize-self-reactions')
        const recognizeBotReactions = interaction.options.getBoolean('recognize-bot-reactions')
        const reaction = interaction.options.getString('reaction')

        const updates: Partial<Tracker> = {}

        if (name) {
            if (name.length > 32) {
                await interaction.reply({
                    embeds: [
                        new SimpleEmbed(
                            `The name you specified ${inlineCode(name)} is over the 32 character name limit. Please correct this and try again`,
                            { color: 'Red', title: 'Invalid Name' }
                        ).getEmbed()
                    ]
                })
                return
            }
            updates.name = name
        }
        if (length !== null) updates.length = length
        if (displayBots !== null) updates.displayBots = displayBots
        if (displayMissingUsers !== null)
            updates.displayMissingUsers = displayMissingUsers
        if (recognizeSelfReactions !== null)
            updates.recognizeSelfReactions = recognizeSelfReactions
        if (recognizeBotReactions !== null)
            updates.recognizeBotReactions = recognizeBotReactions

        if (reaction) {
            const emoteRegex = /(<a?)?:\\w+:(\\d+)?/g
            const guildEmojiNumbers = emoteRegex.exec(reaction)?.[2]
            const isRegularEmoji = hasEmoji(reaction)

            if (isRegularEmoji) {
                updates.reactionType = ReactionType.Emoji
                updates.reactionContent = normalizeEmoji(reaction)
            } else if (guildEmojiNumbers) {
                const guildEmoji = bot.emojis.cache.get(guildEmojiNumbers)
                if (guildEmoji) {
                    updates.reactionType = guildEmoji.animated
                        ? ReactionType.CustomGIF
                        : ReactionType.Custom
                    updates.reactionContent = guildEmoji.id
                } else {
                    await interaction.reply({
                        embeds: [
                            new SimpleEmbed(
                                'An issue occured while trying to parse the supplied reaction. Please rename it or try another one. When using custom emotes, for now you must only use emotes available on this server',
                                { color: 'Red', title: 'Error' }
                            ).getEmbed()
                        ]
                    })
                    return
                }
            } else {
                await interaction.reply({
                    embeds: [
                        new SimpleEmbed(
                            'The reaction you have supplied is unsupported. Please try another one',
                            { color: 'Red', title: 'Error' }
                        ).getEmbed()
                    ]
                })
                return
            }
        }

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

        await Tracker.update(updates, { where: { uuid: tracker.uuid } })

        const links: LeaderboardTrackers[] = await LeaderboardTrackers.findAll({
            where: { trackerId: tracker.uuid }
        })
        for (const link of links) {
            await bot.createOrUpdateLeaderboardEmbed(link.leaderboardId)
        }

        await interaction.reply({
            embeds: [
                new SimpleEmbed(`The tracker ${inlineCode(tracker.uuid)} has been updated`, {
                    color: 'Green',
                    title: 'Tracker Updated'
                }).getEmbed()
            ]
        })
    }

    private async listTrackers(
        bot: Accomplice,
        interaction: ChatInputCommandInteraction
    ): Promise<void> {
        const { Guild, Tracker } = bot.sequelize.models
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

        // All guild trackers
        const trackers = await Tracker.findAll({
            where: {
                guildId: guildRow.uuid
            }
        })

        const trackerListEmbed = new TrackerList().getEmbed({ trackers })

        await interaction.reply({
            embeds: [trackerListEmbed]
        })
    }
}

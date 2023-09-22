import Accomplice from '../accomplice'
import Command from '../types/Command'
import { Guild } from '../sequelize/types/guild'
import { LeaderboardTrackers } from '../sequelize/types/leaderboard_trackers'
import { ReactionType } from '../sequelize/types/reaction'
import { Tracker } from '../sequelize/types/tracker'
import TrackerList from '../embeds/TrackerList'
import { hasEmoji } from '../util/emoji'
import { v4 as uuidv4 } from 'uuid'

import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    channelMention,
    inlineCode
} from 'discord.js'

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
    // TODO

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

            default:
                await interaction.reply('Unhandled subcommand supplied')
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
            await interaction.reply(
                `The name you specified ${inlineCode(
                    displayName
                )} is over the 32 character name limit. Please correct this and try again`
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
            const guildEmoji = bot.emojis.cache.get(guildEmojiNumbers)
            if (guildEmoji) {
                reactionType = ReactionType.Custom
                if (guildEmoji.animated) ReactionType.CustomGIF
                reactionContent = guildEmoji.id
            } else {
                bot.logger.error('Failed to parse discord emoji')
                await interaction.reply(
                    'An issue occured while trying to parse the supplied reaction. Please rename it or try another one. When using custom emotes, for now you must only use emotes available on this server'
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
                'An error occured while trying to lookup your guild. Please try again later'
            )
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
        if (actionConfirm !== true) {
            await interaction.reply(
                'Please confirm this destructive action by setting the `confirm` command argument to true'
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
                )} command`
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
            `The tracker ${inlineCode(tracker.uuid)} has been destroyed`
        )
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
            await interaction.reply(
                'An error has occured, please try again later'
            )

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

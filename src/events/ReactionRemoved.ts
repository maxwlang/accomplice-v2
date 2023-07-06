import { User as DiscordUser, MessageReaction } from 'discord.js'
import Accomplice from '../accomplice'
import EventHandle from '../types/EventHandle'
import { v4 as uuidv4 } from 'uuid'
import { isEmpty } from 'ramda'
import { User } from '../sequelize/types/user'
import { getEmojiType } from '../util/emoji'
import { Reaction } from '../sequelize/types/reaction'
import { Guild } from '../sequelize/types/guild'

export default class ReactionRemoved implements EventHandle {
    public name = 'Reaction Removed'
    public description = 'Updates counts for removed reactions'
    public trigger = 'messageReactionRemove'
    public fireOnce = false

    public execute = async ({
        args,
        bot
    }: {
        args?: unknown[]
        bot: Accomplice
    }): Promise<void> => {
        if (!args || isEmpty(args)) return
        const messageReaction = args[0] as MessageReaction
        const reactorUser = args[1] as DiscordUser
        const { Guild, User, Reaction, GuildUser } = bot.sequelize.models

        if (reactorUser.id === bot.user?.id) return

        bot.logger.debug('User has removed a react')

        // When a reaction is received, check if the structure is partial
        if (messageReaction.partial) {
            // If the message this reaction belongs to was removed,
            // the fetching might result in an API error which should be handled
            try {
                await messageReaction.fetch()
            } catch (error) {
                bot.logger.error(
                    `Something went wrong when fetching the message: ${error}`
                )
                // Return as `reaction.message.author` may be undefined/null
                // If this reaction exists, we'll find it on one of the periodic syncs.
                return
            }
        }

        if (
            !messageReaction.message.author ||
            messageReaction.message.author === null
        ) {
            bot.logger.error(
                'Failed to log reaction, could not identify message author'
            )
            return
        }

        const reacteeSnowflake = messageReaction.message.author.id
        const reacteeIsBot = messageReaction.message.author.bot
        const reactorSnowflake = reactorUser.id
        const reactorIsBot = reactorUser.bot
        let reaction: Reaction | undefined
        let guildRow: Guild | undefined

        try {
            const guildData: [Guild, boolean] = await Guild.findOrCreate({
                where: { snowflake: messageReaction.message.guildId },
                defaults: {
                    uuid: uuidv4(),
                    snowflake: messageReaction.message.guildId,
                    isPriority: false,
                    commandsState: []
                }
            })

            guildRow = guildData[0]
            const guildCreated = guildData[1]

            if (guildCreated) bot.logger.debug('Created guild')

            // find or create reactee user
            const [reactee, reacteeCreated]: [User, boolean] =
                await User.findOrCreate({
                    where: { snowflake: reacteeSnowflake },
                    defaults: {
                        uuid: uuidv4(),
                        snowflake: reacteeSnowflake,
                        isBot: reacteeIsBot
                    }
                })

            if (reacteeCreated) {
                await GuildUser.create({
                    uuid: uuidv4(),
                    guildId: guildRow.uuid,
                    userId: reactee.uuid
                })
                bot.logger.debug('Created new reactee user')
            }
            // find or create reactor user
            const [reactor, reactorCreated]: [User, boolean] =
                await User.findOrCreate({
                    where: { snowflake: reactorSnowflake },
                    defaults: {
                        uuid: uuidv4(),
                        snowflake: reactorSnowflake,
                        isBot: reactorIsBot
                    }
                })

            if (reactorCreated) {
                await GuildUser.create({
                    uuid: uuidv4(),
                    guildId: guildRow.uuid,
                    userId: reactor.uuid
                })
                bot.logger.debug('Created new reactor user')
            }
            if (
                !messageReaction.message.guildId ||
                messageReaction.message.guildId === null
            ) {
                bot.logger.error(
                    'Failed to log reaction, could not locate guild'
                )
                return
            }

            const emoji = messageReaction.emoji
            const emojiType = getEmojiType(emoji)

            if (!emojiType) {
                bot.logger.error('Failed to determine emoji type')
                return
            }

            reaction = await Reaction.findOne({
                where: {
                    guildId: guildRow.uuid,
                    type: emojiType,
                    content: emoji.name,
                    emojiId: emoji.id || null,
                    reacteeUserId: reactee.uuid,
                    reactorUserId: reactor.uuid
                }
            })

            if (!reaction || reaction === null) {
                bot.logger.error("Couldn't locate a reaction to delete")
                return
            }

            bot.logger.info(`Deleting reaction ${reaction.uuid}`)

            await Reaction.destroy({
                where: {
                    uuid: reaction.uuid
                }
            })
        } catch (e) {
            bot.logger.error(`Failed to delete reaction, database error: ${e}`)
            return
        }

        if (!reaction || !guildRow) return

        try {
            const leaderboardIds = await bot.locateLeaderboardsForReaction(
                reaction,
                guildRow.uuid
            )

            const leaderboardUpdates: Promise<void>[] = []
            for (const leaderboardId of leaderboardIds) {
                leaderboardUpdates.push(
                    bot.createOrUpdateLeaderboardEmbed(leaderboardId)
                )
            }

            await Promise.allSettled(leaderboardUpdates)
        } catch (e) {
            bot.logger.error(`Failed to update leaderboard(s): ${e}`)
        }
    }
}

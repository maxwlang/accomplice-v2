import { readdir } from 'fs/promises'
import {
    ChannelType,
    ChatInputCommandInteraction,
    Client,
    Collection,
    Events as DiscordEvents,
    Routes as DiscordRestRoutes,
    GuildTextBasedChannel,
    IntentsBitField,
    NonThreadGuildBasedChannel,
    OAuth2Guild,
    Partials,
    PermissionFlagsBits,
    RESTPostAPIChatInputApplicationCommandsJSONBody
} from 'discord.js'
import { RedisClientType, createClient } from 'redis'
import { Logger } from 'winston'
import EventHandle from './types/EventHandle'
import { Leaderboard } from './sequelize/types/leaderboard'
import { Guild, GuildSyncState } from './sequelize/types/guild'
import { token } from './config/discord'
import { redisPrefix } from './config/redis'
import { v4 as uuidv4 } from 'uuid'
import Command from './types/Command'
import LeaderboardEmbed from './embeds/Leaderboard'
import ApplicationCommandRateLimit from './embeds/ApplicationCommandRateLimit'
import CommandsRegistered from './embeds/CommandsRegistered'
import { User } from './sequelize/types/user'
import { getEmojiType } from './util/emoji'
import { isNil } from 'ramda'
import { Tracker } from './sequelize/types/tracker'
import { Reaction } from './sequelize/types/reaction'

import { Op } from 'sequelize'
import { LeaderboardTrackers } from './sequelize/types/leaderboard_trackers'

export default class Accomplice extends Client {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor({ logger, sequelize }: { logger: Logger; sequelize: any }) {
        super({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.GuildMessageReactions
            ],
            partials: [Partials.Message, Partials.Channel, Partials.Reaction]
        })

        const redisClient = createClient({
            url: process.env['REDIS_URL'] ?? 'redis://localhost:6379'
        })

        redisClient.on('error', err =>
            this.logger.error('Redis Client Error', err)
        )

        this.redis = redisClient
        this.logger = logger
        this.sequelize = sequelize
        this.commands = new Map()
        this.timers = new Map()
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public redis: RedisClientType<any, any, any>
    public logger: Logger
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public sequelize: any // Stupid sequelize shit
    public commands: Map<string, Command>
    public timers: Map<string, NodeJS.Timer>

    private async registerEvents(): Promise<void> {
        await readdir('./dist/events')
            .then((files: string[]) =>
                files.filter(file => file.endsWith('.js'))
            )
            // Load in event handlers
            .then(async (eventFiles: string[]) => {
                for (const eventFile of eventFiles) {
                    try {
                        const EventHandle = (
                            await import(`./events/${eventFile}`)
                        ).default
                        const eventHandle: EventHandle = new EventHandle()

                        this.logger.debug(
                            `[Register Event] Name: "${eventHandle.name}" ; Description: "${eventHandle.description}" ; Fire Once: ${eventHandle.fireOnce}`
                        )

                        if (eventHandle.fireOnce) {
                            this.once(eventHandle.trigger, async (...args) =>
                                eventHandle
                                    .execute({ args, bot: this })
                                    .catch(console.log)
                            )
                        } else {
                            this.on(eventHandle.trigger, async (...args) =>
                                eventHandle
                                    .execute({ args, bot: this })
                                    .catch(console.log)
                            )
                        }
                    } catch (e) {
                        this.logger.error(
                            `Failed to load event handler "${eventFile}" with error: ${e}`
                        )
                    }
                }
            })
    }

    private registerCommandHandler(): void {
        this.on(DiscordEvents.InteractionCreate, async interaction => {
            if (!interaction.isChatInputCommand()) return

            const command = this.commands.get(interaction.commandName)

            if (!command) {
                this.logger.error(
                    `No command matching ${interaction.commandName} was found.`
                )
                return
            }

            try {
                await command.execute({
                    bot: this,
                    interaction
                })
            } catch (error) {
                console.log(error)
                try {
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({
                            content:
                                'There was an error while executing this command!',
                            ephemeral: true
                        })
                    } else {
                        await interaction.reply({
                            content:
                                'There was an error while executing this command!',
                            ephemeral: true
                        })
                    }
                } catch (e) {
                    console.log(
                        'Additionally, an error occured while trying to handle the previous error: ',
                        e
                    )
                }
            }
        })
    }

    private async handleCommandRateLimitError(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        e: any,
        guildId: string
    ): Promise<void> {
        if (!isNil(e?.code) && e.code === 30034) {
            if (this.timers.get(`${guildId}_slash-commands`) !== undefined) {
                this.timers.delete(`${guildId}_slash-commands`)
            }

            this.logger.info(
                `Guild ${guildId} has been put on a command register timer`
            )
            this.timers.set(
                `${guildId}_slash-commands`,
                setTimeout(() => {
                    this.logger.info(
                        `Attempting to register commands for guild ${guildId}`
                    )
                    this.registerCommands(guildId, true)
                }, 900_000)
            )

            const channel = this.findPublicChannel(guildId)

            if (channel) {
                const rateLimitEmbed =
                    new ApplicationCommandRateLimit().getEmbed()
                channel
                    .send({
                        embeds: [rateLimitEmbed]
                    })
                    .catch(e =>
                        this.logger.error(`Failed to send hello message: ${e}`)
                    )
            }
        } else throw e
    }

    public findPublicChannel(
        guildId: string
    ): GuildTextBasedChannel | undefined {
        const guild = this.guilds.cache.get(guildId)

        if (!guild) {
            this.logger.error(
                `Could not find a public channel on guild ${guildId}, undefined guild id.`
            )
            return
        }

        const userId = this.user?.id
        if (!userId) {
            this.logger.error(
                `Could not find a public channel on guild ${userId}, undefined user id.`
            )
            return
        }

        const channel = guild.channels.cache.find(
            channel =>
                (channel.type === ChannelType.GuildText &&
                    channel.members
                        .get(userId)
                        ?.permissions.has(PermissionFlagsBits.SendMessages)) ??
                false
        ) as GuildTextBasedChannel | undefined

        return channel
    }

    public async registerCommands(
        guildId?: string,
        retry?: boolean
    ): Promise<boolean | void> {
        return (
            readdir('./dist/commands')
                .then((files: string[]) =>
                    files.filter(file => file.endsWith('.js'))
                )
                // Load in commands
                .then(async (commandFiles: string[]) => {
                    const commandsJSONArray: RESTPostAPIChatInputApplicationCommandsJSONBody[] =
                        []

                    try {
                        for (const commandFile of commandFiles) {
                            try {
                                const Command = (
                                    await import(`./commands/${commandFile}`)
                                ).default
                                const command: Command = new Command()
                                this.commands.set(command.meta.name, command)
                                commandsJSONArray.push(command.meta.toJSON())
                                this.logger.debug(
                                    `[Load Command] Name: "${command.meta.name}" ; Description: "${command.meta.description}"`
                                )
                            } catch (e) {
                                this.logger.error(
                                    `Failed to load command "${commandFile}" with error: ${e}`
                                )
                            }
                        }

                        let userId = this.user?.id
                        while (!userId) {
                            userId = (await this.user?.fetch())?.id
                        }

                        let guildCollection: Collection<string, OAuth2Guild> =
                            await this.guilds.fetch()

                        // When updating a specific guild
                        if (guildId) {
                            const guild = guildCollection.get(guildId)
                            if (!guild) {
                                throw new Error('Could not locate guild')
                            }

                            guildCollection = new Collection<
                                string,
                                OAuth2Guild
                            >().set(guildId, guild)
                        }

                        const { Guild } = this.sequelize.models

                        for (const [guildId, guild] of guildCollection) {
                            this.logger.debug(
                                `Checking guild commands state for guild "${guild.name}" (${guildId})`
                            )

                            const guildRow: Guild = await Guild.findOne({
                                where: {
                                    snowflake: guildId
                                }
                            })

                            if (!guildRow) {
                                throw new Error(
                                    'Could not locate guild during command update'
                                )
                            }

                            const commandsNeedUpdate =
                                JSON.stringify(commandsJSONArray) !==
                                JSON.stringify(guildRow.commandsState)

                            if (!commandsNeedUpdate) {
                                this.logger.debug(
                                    'Guild commands are up to date'
                                )
                                return
                            }

                            this.logger.debug(
                                `Registering commands with guild "${guild.name}" (${guildId})`
                            )

                            let success = false
                            try {
                                await this.rest
                                    .put(
                                        DiscordRestRoutes.applicationGuildCommands(
                                            userId,
                                            guildId
                                        ),
                                        {
                                            body: commandsJSONArray
                                        }
                                    )
                                    .then(
                                        async () => {
                                            await Guild.update(
                                                {
                                                    commandsState:
                                                        commandsJSONArray
                                                },
                                                {
                                                    where: {
                                                        uuid: guildRow.uuid
                                                    }
                                                }
                                            )

                                            if (retry) {
                                                this.timers.delete(
                                                    `${guildId}_slash-commands`
                                                )

                                                const channel =
                                                    this.findPublicChannel(
                                                        guildId
                                                    )

                                                if (channel) {
                                                    const commandsRegisteredEmbed =
                                                        new CommandsRegistered().getEmbed()
                                                    channel
                                                        .send({
                                                            embeds: [
                                                                commandsRegisteredEmbed
                                                            ]
                                                        })
                                                        .catch(e =>
                                                            this.logger.error(
                                                                `Failed to send commands registered notification: ${e}`
                                                            )
                                                        )
                                                }
                                            }
                                            success = true
                                        },
                                        reason => {
                                            this.logger.error(
                                                'Failed to register commands:'
                                            )
                                            console.log(reason)
                                        }
                                    )
                            } catch (e) {
                                if (!retry) {
                                    this.handleCommandRateLimitError(e, guildId)
                                } else {
                                    throw e
                                }
                            }

                            if (guildId) return success
                        }
                    } catch (e) {
                        this.logger.error(
                            `Failed to load commands with error: ${e}`
                        )
                    }
                })
        )
    }

    public async prepareSynchronizeGuilds(
        guildId?: string,
        interaction?: ChatInputCommandInteraction
    ): Promise<void> {
        this.logger.debug('Preparing to start guild sync')

        let guilds: Collection<string, OAuth2Guild> = new Collection()

        if (guildId) {
            const fetchedGuilds = await this.guilds.fetch()
            const guild = fetchedGuilds.get(guildId)

            if (!guild) {
                this.logger.error(
                    `DiscordJS couldn't resolve guild "${guildId}"`
                )
                return
            }

            guilds.set(guildId, guild)
        } else {
            guilds = await this.guilds.fetch()
        }

        const syncTasks: Promise<void>[] = [] // Fire off tasks in parallel. May bite us in the future if lots of guilds add us at once
        for (const [guildId, guild] of guilds) {
            const { Guild } = this.sequelize.models

            const [guildRow, created]: [Guild, boolean] =
                await Guild.findOrCreate({
                    where: { snowflake: guildId },
                    defaults: {
                        uuid: uuidv4(),
                        snowflake: guildId,
                        isPriority: false
                    }
                })

            if (created) {
                this.logger.info(
                    `Registered guild "${guild.name}" (${guild.id}) in database`
                )
            }

            syncTasks.push(
                this.synchronizeGuilds(guild, guildRow, interaction).catch(
                    e => {
                        this.logger.error(
                            `Failed to synchronize channels for guild ${guild.name} (${guild.id}):`
                        )
                        console.log(e)
                    }
                )
            )
        }

        await Promise.all(syncTasks)
    }

    private async synchronizeGuilds(
        guild: OAuth2Guild,
        guildRow: Guild,
        interaction?: ChatInputCommandInteraction
    ): Promise<void> {
        const { Guild } = this.sequelize.models

        if (
            guildRow.syncState === GuildSyncState.Syncing ||
            guildRow.syncState === GuildSyncState.Synced
        ) {
            return
        }

        await Guild.update(
            { syncState: GuildSyncState.Syncing },
            {
                where: {
                    uuid: guildRow.uuid
                }
            }
        )

        try {
            const channelCollection = await (
                await guild.fetch()
            ).channels.fetch()
            this.logger.info(
                `Syncing ${channelCollection.size} channel(s) for guild "${guild.name}" (${guild.id} | ${guildRow.uuid})`
            )

            const channels = Array.from(channelCollection.values())
            const channelTaskChunks = []
            const taskChunkSize = 3 // How many channels to process at once
            let chunkProgress = 0 // How many chunks have been processed
            const messageLimit = 10_000 // How far back we will go in each channel

            while (channels.length > 0) {
                channelTaskChunks.push(channels.splice(0, taskChunkSize))
            }

            this.logger.debug(`channelTaskChunks: ${channelTaskChunks.length}`)

            for (const channelTaskChunk of channelTaskChunks) {
                const channelTask = channelTaskChunk.map(channel => {
                    if (channel) {
                        return this.updateReactionsForChannel(
                            channel,
                            messageLimit
                        )
                    }
                })

                await Promise.all(channelTask)
                chunkProgress++

                if (interaction) {
                    interaction.followUp(
                        `progress update: ${chunkProgress} chunks complete of ${channelTaskChunks.length}` // TODO: Embed
                    )
                }
            }

            await Guild.update(
                { syncState: GuildSyncState.Synced },
                {
                    where: {
                        uuid: guildRow.uuid
                    }
                }
            )

            if (interaction) {
                await interaction.followUp('finished') // TODO: Embed
            }
        } catch (e) {
            await Guild.update(
                { syncState: GuildSyncState.Errored },
                {
                    where: {
                        uuid: guildRow.uuid
                    }
                }
            )
            this.logger.error(
                `Failed to sync guild "${guild.name}" (${guild.id} | ${guildRow.uuid}`
            )
            console.log(e)
        }
    }

    private async updateReactionsForChannel(
        channel: NonThreadGuildBasedChannel,
        messageLimit: number
    ): Promise<void> {
        if (channel.type === ChannelType.GuildText && channel.lastMessageId) {
            this.logger.debug(
                `Grabbing messages from channel "${channel.guild.name}:${channel.name}" (${channel.guildId}:${channel.id})`
            )

            const { Guild, Reaction, User, GuildUser } = this.sequelize.models

            try {
                let messagesIndexed = 0
                let messageCheckpoint: string = channel.lastMessageId
                while (messagesIndexed < messageLimit) {
                    this.logger.debug(`message index size: ${messagesIndexed}`)
                    const fetchedMessages = await channel.messages.fetch({
                        limit: 100,
                        before: messageCheckpoint
                    })

                    const lastMessage = fetchedMessages.last()
                    if (!lastMessage) break
                    if (messageCheckpoint === lastMessage.id) break // Done with channel

                    const guildRow: Guild = await Guild.findOne({
                        where: {
                            snowflake: channel.guildId
                        }
                    })

                    if (!guildRow) {
                        throw new Error(
                            'Could not locate guild during reaction tally for channel'
                        )
                    }

                    // For each message
                    fetchedMessages.forEach(
                        async (message, messageSnowflake) => {
                            if (message.reactions.cache.size === 0) return // Only care about messages with reacts

                            // find or create reactee user
                            const [reactee, reacteeCreated]: [User, boolean] =
                                await User.findOrCreate({
                                    where: { snowflake: message.author.id },
                                    defaults: {
                                        uuid: uuidv4(),
                                        snowflake: message.author.id,
                                        isBot: message.author.bot
                                    }
                                })

                            if (reacteeCreated) {
                                await GuildUser.create({
                                    uuid: uuidv4(),
                                    guildId: guildRow.uuid,
                                    userId: reactee.uuid
                                })
                                this.logger.debug('Created new reactee user')
                            }

                            // For each unique? reaction on message
                            message.reactions.cache.forEach(
                                async messageReaction => {
                                    // For each user that reacted
                                    const users =
                                        await messageReaction.users.fetch()

                                    users.forEach(async user => {
                                        // find or create reactor user
                                        const [reactor, reactorCreated]: [
                                            User,
                                            boolean
                                        ] = await User.findOrCreate({
                                            where: { snowflake: user.id },
                                            defaults: {
                                                uuid: uuidv4(),
                                                snowflake: user.id,
                                                isBot: user.bot
                                            }
                                        })

                                        if (reactorCreated) {
                                            await GuildUser.create({
                                                uuid: uuidv4(),
                                                guildId: guildRow.uuid,
                                                userId: reactor.uuid
                                            })
                                            this.logger.debug(
                                                'Created new reactor user'
                                            )
                                        }

                                        const emoji = messageReaction.emoji
                                        const emojiType = getEmojiType(emoji)

                                        if (!emojiType) {
                                            this.logger.error(
                                                'Failed to determine emoji type'
                                            )
                                            return
                                        }

                                        await Reaction.findOrCreate({
                                            where: {
                                                guildId: guildRow.uuid,
                                                type: emojiType,
                                                content: emoji.name,
                                                emojiId: emoji.id || null,
                                                messageSnowflake,
                                                reacteeUserId: reactee.uuid,
                                                reactorUserId: reactor.uuid
                                            },
                                            defaults: {
                                                uuid: uuidv4(),
                                                guildId: guildRow.uuid,
                                                type: emojiType,
                                                content: emoji.name,
                                                emojiId: emoji.id || null,
                                                messageSnowflake,
                                                reacteeUserId: reactee.uuid,
                                                reactorUserId: reactor.uuid
                                            }
                                        })
                                    })
                                }
                            )
                        }
                    )

                    // store reaction data

                    messagesIndexed = messagesIndexed + fetchedMessages.size
                    messageCheckpoint = lastMessage.id
                }
            } catch (e) {
                this.logger.error(
                    `Failed grabbing messages from channel "${channel.guild.name}:${channel.name}" (${channel.guildId}:${channel.id})`
                )
                console.log(e)
            }
        }
    }

    public async createOrUpdateLeaderboardEmbed(
        leaderboardId: string,
        deleteEmbed?: true
    ): Promise<void> {
        const { Leaderboard, LeaderboardTrackers, Tracker, Reaction } =
            this.sequelize.models
        this.logger.debug(`Create or update leaderboard ${leaderboardId}`)

        // Get leaderboard
        const leaderboard: Leaderboard | null = await Leaderboard.findOne({
            where: { uuid: leaderboardId }
        })

        if (!leaderboard) {
            this.logger.error(
                `Failed to locate leaderboard in database ${leaderboardId}`
            )
            return
        }

        const leaderboardChannel = await this.channels.resolve(
            leaderboard.channelSnowflake
        )

        if (!leaderboardChannel || !leaderboardChannel.isTextBased()) {
            this.logger.error(
                `Leaderboard channel does not exist or is of invalid type ${leaderboardId}:${leaderboard.channelSnowflake}`
            )
            return
        }

        await leaderboardChannel.fetch()

        const leaderboardTrackers: LeaderboardTrackers[] =
            await LeaderboardTrackers.findAll({
                where: { leaderboardId: leaderboard.uuid }
            })

        const trackers: Tracker[] = await Tracker.findAll({
            where: {
                [Op.or]: leaderboardTrackers.map(leaderboardTracker => ({
                    uuid: leaderboardTracker.trackerId
                }))
            }
        })

        // const reactions: Reaction[] = await Reaction.findAll({
        //     where: {
        //         [Op.or]: trackers.map(tracker => ({
        //             uuid: tracker.
        //         }))
        //     }
        // })

        const leaderboardEmbed = new LeaderboardEmbed()
        const embed = leaderboardEmbed.getEmbed({ leaderboard, trackers })
        const components = leaderboardEmbed.getComponents({
            leaderboard,
            trackers
        })

        const messageId = leaderboard.messageSnowflake
        if (messageId) {
            const messages = await leaderboardChannel.messages.fetch({
                around: messageId,
                limit: 1
            })
            const message = messages.get(messageId)

            if (message) {
                if (deleteEmbed) {
                    await message.delete()
                    this.logger.debug('Leaderboard embed deleted')
                } else {
                    await message.edit({
                        embeds: [embed],
                        // @ts-expect-error This works even though the type is not supported. TODO: Make this comment unnecessary
                        components
                    })
                    this.logger.debug('Leaderboard embed updated')
                }
                return
            }
        }

        console.log('=-as=dsa-=-as=d-asd=as-d=as-d=as-d')

        const sentMessage = await leaderboardChannel
            .send({
                embeds: [embed],
                // @ts-expect-error This works even though the type is not supported. TODO: Make this comment unnecessary
                components
            })
            .catch(e => console.log(e))
        this.logger.debug('leaderboard embed created')
        if (!sentMessage) return

        await Leaderboard.update(
            { messageSnowflake: sentMessage.id },
            {
                where: {
                    uuid: leaderboard.uuid
                }
            }
        )
    }

    public async locateLeaderboardsForReaction(
        reaction: Reaction,
        guildId: string
    ): Promise<string[]> {
        const { Tracker, LeaderboardTrackers } = this.sequelize.models
        const trackers: Pick<Tracker, 'uuid'>[] = await Tracker.findAll({
            attributes: ['uuid'],
            group: ['uuid'],
            where: {
                [Op.and]: [
                    {
                        [Op.or]: [
                            {
                                reactionType: reaction.type
                            },
                            {
                                reactionContent: reaction.content
                            }
                            // TODO:
                            // {
                            //     reacteeUserId: reaction.reacteeUserId
                            // },
                            // {
                            //     reactorUserId: reaction.reactorUserId
                            // }
                        ]
                    },
                    {
                        guildId
                    }
                ]
            }
        })

        const leaderboardConditional: { trackerId: string }[] = trackers.map(
            tracker => ({ trackerId: tracker.uuid })
        )

        const leaderboardTrackers: Pick<
            LeaderboardTrackers,
            'leaderboardId'
        >[] = await LeaderboardTrackers.findAll({
            attributes: ['leaderboardId'],
            group: ['leaderboardId'],
            where: {
                [Op.and]: [
                    {
                        [Op.or]: leaderboardConditional
                    },
                    {
                        guildId
                    }
                ]
            }
        })

        return leaderboardTrackers.map(
            leaderboardTracker => leaderboardTracker.leaderboardId
        )
    }

    public async start(): Promise<Accomplice> {
        // Setup redis, perform quick write check
        const uniqueKey = uuidv4()
        await this.redis.connect()
        await this.redis.set(`${redisPrefix}${uniqueKey}_test`, 'success')
        const redisValue: string | null = await this.redis.get(
            `${redisPrefix}${uniqueKey}_test`
        )
        if (!redisValue || redisValue !== 'success') {
            throw new Error('Redis check failed')
        }
        await this.redis.del(`${redisPrefix}${uniqueKey}_test`)

        await this.registerEvents() // Configure event listeners
        await this.login(token)

        await this.prepareSynchronizeGuilds() // Get up to date with messages in guilds
        this.registerCommandHandler() // Configure command event listeners
        await this.registerCommands() // Register commands w/ guilds

        return this
    }
}

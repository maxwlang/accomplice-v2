import { readdir } from 'fs/promises'
import {
    ChannelType,
    ChatInputCommandInteraction,
    Client,
    Collection,
    Events as DiscordEvents,
    Routes as DiscordRestRoutes,
    IntentsBitField,
    OAuth2Guild,
    Partials,
    RESTPostAPIChatInputApplicationCommandsJSONBody
} from 'discord.js'
import { RedisClientType, createClient } from 'redis'
import { Logger } from 'winston'
import EventHandle from './types/EventHandle'
import { Leaderboard } from './sequelize/types/leaderboard'
import { Guild } from './sequelize/types/guild'
import { token } from './config/discord'
import { redisPrefix } from './config/redis'
import { v4 as uuidv4 } from 'uuid'
import Command from './types/Command'
import LeaderboardEmbed from './embeds/Leaderboard'

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
        this.commands = new Collection()

        // this.periodicSync = null
        // this.statusEmbed = null
        // this.statusEmbedIndex = 0
        // this.syncing = false
        // this.db = db
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public redis: RedisClientType<any, any, any>
    public logger: Logger
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public sequelize: any // Stupid sequelize shit
    public commands: Collection<string, Command>

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
                                eventHandle.execute({ args, bot: this })
                            )
                        } else {
                            this.on(eventHandle.trigger, async (...args) =>
                                eventHandle.execute({ args, bot: this })
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

    public async registerCommands(guildId?: string): Promise<void> {
        await readdir('./dist/commands')
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

                    if (guildId) {
                        this.logger.debug(
                            `Registering commands with guild ${guildId}`
                        )
                        await this.rest.put(
                            DiscordRestRoutes.applicationGuildCommands(
                                userId,
                                guildId
                            ),
                            {
                                body: commandsJSONArray
                            }
                        )
                    } else {
                        for (const guildCollection of await this.guilds.fetch()) {
                            this.logger.debug(
                                `Registering commands with guild "${guildCollection[1].name}" (${guildCollection[1].id})`
                            )
                            await this.rest.put(
                                DiscordRestRoutes.applicationGuildCommands(
                                    userId,
                                    guildCollection[1].id
                                ),
                                {
                                    body: commandsJSONArray
                                }
                            )
                        }
                    }
                } catch (e) {
                    this.logger.error(
                        `Failed to load commands with error: ${e}`
                    )
                }
                return commandFiles
            })
    }

    public async synchronizeGuilds(
        guildId?: string,
        interaction?: ChatInputCommandInteraction
    ): Promise<void> {
        let guilds: Collection<string, OAuth2Guild> = new Collection()

        if (guildId) {
            const fetchedGuilds = await this.guilds.fetch()
            const guild = fetchedGuilds.get(guildId)

            if (!guild || guild === null) {
                this.logger.error(
                    `DiscordJS couldn't resolve guild "${guildId}"`
                )
                return
            }

            guilds.set(guildId, guild)
        } else {
            guilds = await this.guilds.fetch()
        }

        for (const [guildId, guild] of guilds) {
            const { Guild } = this.sequelize.models

            const [guildRow, created] = await Guild.findOrCreate({
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

            this.synchronizeChannels(guild, guildRow, interaction)
        }
    }

    private async synchronizeChannels(
        guild: OAuth2Guild,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        guildRow: any, // Stupid sequelize shit
        interaction?: ChatInputCommandInteraction
    ): Promise<void> {
        // Used when triggered via chat command, provides progress updates
        if (interaction) {
            await interaction.followUp('status here')
        }
        console.log(guild.id, guildRow)
    }

    public async createOrUpdateLeaderboardEmbed(
        leaderboardId: string,
        deleteEmbed?: true
    ): Promise<void> {
        const { Guild, Leaderboard } = this.sequelize.models

        // Get leaderboard
        const leaderboard: Leaderboard | null = await Leaderboard.findOne({
            where: { uuid: leaderboardId }
        })

        if (leaderboard === null || !leaderboard) {
            this.logger.error('Failed to locate leaderboard in database')
            return
        }

        // Get leaderboard guild
        const guild: Guild | null = await Guild.findOne({
            where: { uuid: leaderboard.guildId }
        })

        if (guild === null || !guild) {
            this.logger.error('Failed to locate guild in database')
            return
        }

        const messageId = leaderboard.messageSnowflake
        const guildsCollection = await this.guilds.fetch()
        const leaderboardGuild = guildsCollection.get(guild.snowflake)

        if (!leaderboardGuild || leaderboardGuild === null) {
            this.logger.error('Failed to locate leaderboard guild')
            return
        }

        // Get channels from guild
        const guildChannels = await (
            await leaderboardGuild.fetch()
        ).channels.fetch()

        // Find leaderboard channel
        let leaderboardChannel = guildChannels.get(leaderboard.channelSnowflake)

        if (!leaderboardChannel || leaderboardChannel === null) {
            this.logger.error('Failed to locate leaderboard channel')
            return
        }

        leaderboardChannel = await leaderboardChannel.fetch()

        if (leaderboardChannel.type !== ChannelType.GuildText) {
            this.logger.error('Leaderboard channel is of an invalid type')
            return
        }

        if (!messageId || messageId === null || !deleteEmbed) {
            // Leaderboard message id doesn't exist in DB, create new leaderboard message
            const leaderboardEmbed = new LeaderboardEmbed()
            const message = await leaderboardChannel.send({
                embeds: [leaderboardEmbed.getEmbed({ leaderboard })]
            })

            // Change everyone without a last name to "Doe"
            await Leaderboard.update(
                { messageSnowflake: message.id },
                {
                    where: {
                        uuid: leaderboard.uuid
                    }
                }
            )
        } else {
            // Leaderboard message id exists, obtain a state of that message
            const messages = await leaderboardChannel.messages.fetch()
            const leaderboardMessage = messages.get(messageId)

            if (!leaderboardMessage || leaderboardMessage === null) {
                this.logger.error('Leaderboard message does not exist')
                return
            }

            if (deleteEmbed) {
                await leaderboardMessage.delete()
            } else {
                await leaderboardMessage.edit('hello world')
            }
        }
    }

    // public async createOrUpdateLeaderboardEmbeds(
    //     guildId: string
    // ): Promise<void> {
    //     console.log('update leaderboards', guildId)
    //     // for each leaderboard in guild
    //     //  // this.createOrUpdateLeaderboardEmbed(leaderboard.id)
    // }

    //
    // private async checkGuildSyncStates(): Promise<void> {
    //     // for each guild of guilds
    //     //    // for each channel of guild
    //     //        // if channel.getLatestMessage().snowflake !== db.channels.findBySnowflake(channel.snowflake).latestMessageSnowflake
    //     //          // // channel sync is behind, update channel content
    //     //          // for each message of channel since latestMessageSnowflake
    //     //              // db.reacts.store(message.reacts)
    // }

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

        await this.synchronizeGuilds() // Get up to date with messages in guilds
        this.registerCommandHandler() // Configure command event listeners
        await this.registerCommands() // Register commands w/ guilds
        // this.registerLeaderboards() // Get messages from snowflake ids in db, edit every 2.5 min?

        return this
    }
}

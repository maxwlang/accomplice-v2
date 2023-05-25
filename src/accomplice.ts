import { readdir } from 'fs/promises'
import {
    Client,
    Collection,
    Events as DiscordEvents,
    Routes as DiscordRestRoutes,
    IntentsBitField,
    Partials,
    RESTPostAPIChatInputApplicationCommandsJSONBody
} from 'discord.js'
import { RedisClientType, createClient } from 'redis'
import { Logger } from 'winston'
import EventHandle from './types/EventHandle'
import { token } from './config/discord'
import { redisPrefix } from './config/redis'
import { v4 as uuidv4 } from 'uuid'
import Command from './types/Command'

export default class Accomplice extends Client {
    constructor({ logger }: { logger: Logger }) {
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

                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } catch (e: any) {
                        this.logger.error(
                            `Failed to load event handler "${eventFile}" with error: ${e.toString()}`
                        )
                    }
                }
            })
    }

    private async registerCommands(): Promise<void> {
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
                this.logger.error(error)
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
            }
        })

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
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        } catch (e: any) {
                            this.logger.error(
                                `Failed to load command "${commandFile}" with error: ${e.toString()}`
                            )
                        }
                    }

                    let userId = this.user?.id
                    while (!userId) {
                        userId = (await this.user?.fetch())?.id
                    }

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

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (e: any) {
                    this.logger.error(
                        `Failed to load commands with error: ${e.toString()}`
                    )
                }
                return commandFiles
            })
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
        // await this.redis.disconnect() // Is it better practice to leave redis connected?

        await this.registerEvents()
        await this.login(token)
        await this.registerCommands()

        return this
    }
}

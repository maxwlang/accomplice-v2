import { readdir } from 'fs/promises'
import { Client, IntentsBitField, Partials } from 'discord.js'
import { RedisClientType, createClient } from 'redis'
import { Logger } from 'winston'
import EventHandle from './types/EventHandle'
import { token } from './config/discord'
import { redisPrefix } from './config/redis'
import { v4 as uuidv4 } from 'uuid'

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

        // this.periodicSync = null
        // this.statusEmbed = null
        // this.statusEmbedIndex = 0
        // this.syncing = false
        // this.db = db
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public redis: RedisClientType<any, any, any>
    public logger: Logger

    public async start(): Promise<Accomplice> {
        // Setup redis, perform quick write check
        await this.redis.connect()
        const redisTestValue = uuidv4()
        await this.redis.set(`${redisPrefix}redis_test`, redisTestValue)
        const redisValue: string | null = await this.redis.get(
            `${redisPrefix}redis_test`
        )
        if (!redisValue || redisValue === redisTestValue) {
            throw new Error('Redis check failed')
        }
        await this.redis.del(`${redisPrefix}redis_test`)
        // await this.redis.disconnect() // Is it better practice to leave redis connected?

        // TODO: Can we make this stricter?
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

                        this.logger.info(
                            `Registering event handle: Name: "${eventHandle.name}" ; Description: "${eventHandle.description}" ; Fire Once: ${eventHandle.fireOnce}`
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

        await this.login(token)

        return this
    }
}

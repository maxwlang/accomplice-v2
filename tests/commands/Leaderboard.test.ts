import LeaderboardCommand from '../../src/commands/Leaderboard'

describe('Leaderboard synchronize command', () => {
    it('syncs a specific channel when provided', async () => {
        const cmd = new LeaderboardCommand()
        const reply = jest.fn()
        const followUp = jest.fn()
        const channel = { isTextBased: () => true } as any
        const bot = { synchronizeChannel: jest.fn() } as any
        const interaction = {
            guildId: '1',
            options: {
                getSubcommand: () => 'synchronize',
                getChannel: () => channel,
                getBoolean: () => false
            },
            reply,
            followUp
        } as any
        await cmd.execute({ bot, interaction })
        expect(bot.synchronizeChannel).toHaveBeenCalledWith(
            channel,
            interaction
        )
    })

    it('requires confirmation for full guild sync', async () => {
        const cmd = new LeaderboardCommand()
        const reply = jest.fn()
        const interaction = {
            guildId: '1',
            options: {
                getSubcommand: () => 'synchronize',
                getChannel: () => null,
                getBoolean: () => false
            },
            reply
        } as any
        await cmd.execute({ bot: {} as any, interaction })
        const response = reply.mock.calls[0][0]
        expect(response.embeds).toHaveLength(1)
        const embed = response.embeds[0]
        expect(embed.data.description).toBe(
            'Confirmation required to resync entire guild'
        )
    })

    it('syncs entire guild when confirmed', async () => {
        const cmd = new LeaderboardCommand()
        const reply = jest.fn()
        const bot = { prepareSynchronizeGuilds: jest.fn() } as any
        const interaction = {
            guildId: '1',
            options: {
                getSubcommand: () => 'synchronize',
                getChannel: () => null,
                getBoolean: () => true
            },
            reply
        } as any
        await cmd.execute({ bot, interaction })
        expect(bot.prepareSynchronizeGuilds).toHaveBeenCalledWith(
            '1',
            interaction
        )
    })
})


describe('Leaderboard create/destroy/track/untrack/list commands', () => {
    it('creates a leaderboard when guild exists', async () => {
        const cmd = new LeaderboardCommand()
        const reply = jest.fn()
        const interaction = {
            guildId: '1',
            options: {
                getSubcommand: () => 'create',
                getChannel: () => ({ id: 'c1' }),
                getBoolean: jest.fn(() => true),
                getInteger: jest.fn(() => null)
            },
            reply
        } as any
        const findOrCreate = jest.fn().mockResolvedValue([{ uuid: 'lb1' }, true])
        const bot = {
            sequelize: {
                models: {
                    Guild: { findOne: jest.fn().mockResolvedValue({ uuid: 'g1' }) },
                    Leaderboard: { findOrCreate }
                }
            },
            createOrUpdateLeaderboardEmbed: jest.fn(),
            logger: { error: jest.fn() }
        } as any
        await cmd.execute({ bot, interaction })
        expect(findOrCreate).toHaveBeenCalled()
        expect(bot.createOrUpdateLeaderboardEmbed).toHaveBeenCalledWith('lb1')
        const embed = reply.mock.calls[0][0].embeds[0]
        expect(embed.data.title).toBe('Leaderboard Created')
    })

    it('destroys a leaderboard with confirmation', async () => {
        const cmd = new LeaderboardCommand()
        const reply = jest.fn()
        const interaction = {
            guildId: '1',
            options: {
                getSubcommand: () => 'destroy',
                getBoolean: () => true,
                getChannel: () => ({ id: 'c1' })
            },
            reply
        } as any
        const destroy = jest.fn()
        const destroyLt = jest.fn()
        const bot = {
            sequelize: {
                models: {
                    Guild: { findOne: jest.fn().mockResolvedValue({ uuid: 'g1' }) },
                    Leaderboard: { findOne: jest.fn().mockResolvedValue({ uuid: 'lb1' }), destroy },
                    LeaderboardTrackers: { destroy: destroyLt }
                }
            },
            createOrUpdateLeaderboardEmbed: jest.fn()
        } as any
        await cmd.execute({ bot, interaction })
        expect(destroy).toHaveBeenCalled()
        expect(destroyLt).toHaveBeenCalled()
        expect(bot.createOrUpdateLeaderboardEmbed).toHaveBeenCalledWith('lb1', undefined, true)
        const embed = reply.mock.calls[0][0].embeds[0]
        expect(embed.data.title).toBe('Leaderboard Removed')
    })

    it('tracks and untracks trackers', async () => {
        const cmd = new LeaderboardCommand()
        const reply = jest.fn()
        const optionsTrack = {
            getSubcommand: () => 'track',
            getChannel: () => ({ id: 'c1' }),
            getString: () => 't1',
            getBoolean: () => true
        }
        const optionsUntrack = {
            getSubcommand: () => 'untrack',
            getChannel: () => ({ id: 'c1' }),
            getString: () => 't1'
        }
        const findOrCreate = jest.fn().mockResolvedValue([{ uuid: 'lt1' }, true])
        const destroy = jest.fn()
        const update = jest.fn()
        const bot = {
            sequelize: {
                models: {
                    Guild: { findOne: jest.fn().mockResolvedValue({ uuid: 'g1' }) },
                    Leaderboard: {
                        findOne: jest.fn().mockResolvedValue({ uuid: 'lb1', defaultLeaderboardTrackerId: null }),
                        update
                    },
                    Tracker: { findOne: jest.fn().mockResolvedValue({ uuid: 't1' }) },
                    LeaderboardTrackers: {
                        findOrCreate,
                        findOne: jest.fn().mockResolvedValue({ uuid: 'lt1' }),
                        destroy,
                        count: jest.fn().mockResolvedValue(0)
                    }
                }
            },
            createOrUpdateLeaderboardEmbed: jest.fn(),
            logger: { debug: jest.fn() }
        } as any
        await cmd.execute({ bot, interaction: { guildId: '1', options: optionsTrack, reply } as any })
        expect(findOrCreate).toHaveBeenCalled()
        expect(update).toHaveBeenCalledWith({ defaultLeaderboardTrackerId: 'lt1' }, { where: { uuid: 'lb1' } })
        await cmd.execute({ bot, interaction: { guildId: '1', options: optionsUntrack, reply } as any })
        expect(destroy).toHaveBeenCalled()
        expect(bot.createOrUpdateLeaderboardEmbed).toHaveBeenCalledWith('lb1')
    })

    it('lists trackers on a leaderboard', async () => {
        const cmd = new LeaderboardCommand()
        const reply = jest.fn()
        const interaction = {
            guildId: '1',
            options: { getSubcommand: () => 'trackers', getChannel: () => ({ id: 'c1' }) },
            reply
        } as any
        const bot = {
            sequelize: {
                models: {
                    Guild: { findOne: jest.fn().mockResolvedValue({ uuid: 'g1' }) },
                    Tracker: { findOnce: jest.fn().mockResolvedValue({ uuid: 't1', name: 'tracker', reactionType: 0, length: 1 }) },
                    Leaderboard: { findOne: jest.fn().mockResolvedValue({ uuid: 'lb1' }) },
                    LeaderboardTrackers: { findAll: jest.fn().mockResolvedValue([{ trackerId: 't1', uuid: 'lt1' }]) }
                }
            }
        } as any
        await cmd.execute({ bot, interaction })
        const embed = reply.mock.calls[0][0].embeds[0]
        expect(embed.data.title).toBe('Trackers')
    })

    it('lists available leaderboards', async () => {
        const cmd = new LeaderboardCommand()
        const reply = jest.fn()
        const interaction = { guildId: '1', options: { getSubcommand: () => 'list' }, reply } as any
        const bot = {
            sequelize: {
                models: {
                    Guild: { findOne: jest.fn().mockResolvedValue({ uuid: 'g1' }) },
                    Leaderboard: { findAll: jest.fn().mockResolvedValue([{ uuid: 'lb1', guildId: 'g1', messageSnowflake: null, channelSnowflake: 'c1', deleteUserMessages: false, defaultTrackerTimeout: 120, defaultLeaderboardTrackerId: null }]) }
                }
            }
        } as any
        await cmd.execute({ bot, interaction })
        const embed = reply.mock.calls[0][0].embeds[0]
        expect(embed.data.title).toBe('Leaderboards')
    })
})

describe('Leaderboard error handling', () => {
    it('returns error when guild not found', async () => {
        const cmd = new LeaderboardCommand()
        const reply = jest.fn()
        const interaction = {
            guildId: '1',
            options: {
                getSubcommand: () => 'create',
                getChannel: () => ({ id: 'c1' }),
                getBoolean: jest.fn(() => null),
                getInteger: jest.fn(() => null)
            },
            reply
        } as any
        const bot = {
            sequelize: { models: { Guild: { findOne: jest.fn().mockResolvedValue(null) }, Leaderboard: { findOrCreate: jest.fn() } } },
            logger: { error: jest.fn() }
        } as any
        await cmd.execute({ bot, interaction })
        const embed = reply.mock.calls[0][0].embeds[0]
        expect(embed.data.title).toBe('Error')
    })

    it('errors on invalid channel for sync', async () => {
        const cmd = new LeaderboardCommand()
        const reply = jest.fn()
        const channel = { isTextBased: () => false } as any
        const interaction = {
            guildId: '1',
            options: {
                getSubcommand: () => 'synchronize',
                getChannel: () => channel,
                getBoolean: () => false
            },
            reply
        } as any
        await cmd.execute({ bot: {} as any, interaction })
        const embed = reply.mock.calls[0][0].embeds[0]
        expect(embed.data.title).toBe('Invalid Channel')
    })
})


import TrackerCommand from '../../src/commands/Tracker'

describe('Tracker update command', () => {
    it('updates tracker fields', async () => {
        const cmd = new TrackerCommand()
        const reply = jest.fn()
        const getSubcommand = jest.fn(() => 'update')
        const getString = jest.fn((name: string) => (name === 'id' ? 't1' : name === 'name' ? 'Tracker' : null))
        const getInteger = jest.fn((name: string) => (name === 'length' ? 10 : null))
        const getBoolean = jest.fn(() => null)
        const interaction = {
            guildId: '1',
            options: { getSubcommand, getString, getInteger, getBoolean },
            reply
        } as any
        const update = jest.fn()
        const findOne = jest.fn().mockResolvedValue({ uuid: 't1' })
        const bot = {
            emojis: { cache: new Map() },
            sequelize: { models: { Guild: { findOne: jest.fn().mockResolvedValue({ uuid: 'g1' }) }, Tracker: { findOne, update }, LeaderboardTrackers: { findAll: jest.fn().mockResolvedValue([]) } } },
            createOrUpdateLeaderboardEmbed: jest.fn()
        } as any
        await cmd.execute({ bot, interaction })
        expect(update).toHaveBeenCalledWith(
            { name: 'Tracker', length: 10 },
            { where: { uuid: 't1' } }
        )
        expect(reply).toHaveBeenCalled()
    })
})

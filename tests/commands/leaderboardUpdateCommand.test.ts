import LeaderboardCommand from '../../src/commands/Leaderboard'

describe('Leaderboard update command', () => {
    it('updates leaderboard fields', async () => {
        const cmd = new LeaderboardCommand()
        const reply = jest.fn()
        const getSubcommand = jest.fn(() => 'update')
        const getChannel = jest.fn(() => ({ id: 'c1' }))
        const getBoolean = jest.fn((name: string) => (name === 'delete-user-messages' ? true : null))
        const getInteger = jest.fn((name: string) => (name === 'default-tracker-timeout' ? 300 : null))
        const interaction = {
            guildId: '1',
            options: { getSubcommand, getChannel, getBoolean, getInteger },
            reply
        } as any
        const update = jest.fn()
        const findOne = jest.fn().mockResolvedValue({ uuid: 'lb1' })
        const bot = {
            sequelize: { models: { Guild: { findOne: jest.fn().mockResolvedValue({ uuid: 'g1' }) }, Leaderboard: { findOne, update } } },
            createOrUpdateLeaderboardEmbed: jest.fn()
        } as any
        await cmd.execute({ bot, interaction })
        expect(update).toHaveBeenCalledWith(
            { deleteUserMessages: true, defaultTrackerTimeout: 300 },
            { where: { uuid: 'lb1' } }
        )
        expect(bot.createOrUpdateLeaderboardEmbed).toHaveBeenCalledWith('lb1')
        expect(reply).toHaveBeenCalled()
    })
})

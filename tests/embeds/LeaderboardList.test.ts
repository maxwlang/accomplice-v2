import LeaderboardList from '../../src/embeds/LeaderboardList'
import { Colors, channelMention } from 'discord.js'
import { Leaderboard } from '../../src/sequelize/types/leaderboard'

describe('LeaderboardList embed', () => {
    it('handles no leaderboards', () => {
        const embed = new LeaderboardList().getEmbed([])
        expect(embed.data.color).toBe(Colors.Orange)
        expect(embed.data.description).toContain('no leaderboards')
    })

    it('lists leaderboard channels', () => {
        const boards: Leaderboard[] = [
            {
                uuid: 'l1',
                guildId: 'g',
                messageSnowflake: null,
                channelSnowflake: '123',
                deleteUserMessages: false,
                defaultTrackerTimeout: 0,
                defaultLeaderboardTrackerId: null
            }
        ]
        const embed = new LeaderboardList().getEmbed(boards)
        expect(embed.data.color).toBe(Colors.Blue)
        expect(embed.data.description).toContain(channelMention('123'))
    })
})

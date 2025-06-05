import LeaderboardEmbed from '../../src/embeds/Leaderboard'
import { Colors } from 'discord.js'
import { Leaderboard } from '../../src/sequelize/types/leaderboard'

describe('Leaderboard embed', () => {
  it('defaults when no trackers', () => {
    const lb: Leaderboard = {
      uuid: 'lb1',
      guildId: 'g',
      messageSnowflake: null,
      channelSnowflake: '123',
      deleteUserMessages: false,
      defaultTrackerTimeout: 0,
      defaultLeaderboardTrackerId: null
    }

    const embed = new LeaderboardEmbed().getEmbed({
      leaderboard: lb,
      trackers: [],
      trackerReactions: new Map()
    })

    expect(embed.data.title).toBe('Leaderboard')
    expect(embed.data.color).toBe(Colors.Grey)
    expect(embed.data.description).toContain('/leaderboard track')
  })
})

import TrackerList from '../../src/embeds/TrackerList'
import { Colors } from 'discord.js'
import { ReactionType } from '../../src/sequelize/types/reaction'
import { Tracker } from '../../src/sequelize/types/tracker'

describe('TrackerList embed', () => {
  it('shows empty state', () => {
    const embed = new TrackerList().getEmbed({ trackers: [] })
    expect(embed.data.color).toBe(Colors.Orange)
    expect(embed.data.description).toContain('no trackers')
  })

  it('lists trackers', () => {
    const trackers: Tracker[] = [{
      uuid: 'id1',
      guildId: 'g',
      name: 'stars',
      imageUrl: null,
      length: 5,
      reactionType: ReactionType.Emoji,
      displayBots: false,
      displayMissingUsers: false,
      reactionContent: '⭐',
      recognizeSelfReactions: false,
      recognizeBotReactions: false
    }]
    const embed = new TrackerList().getEmbed({ trackers })
    expect(embed.data.color).toBe(Colors.Blue)
    expect(embed.data.description).toContain('stars')
    expect(embed.data.description).toContain('⭐')
  })
})

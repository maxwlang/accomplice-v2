import LeaderboardEmbed from '../../src/embeds/Leaderboard'
import { Colors } from 'discord.js'
import { Leaderboard } from '../../src/sequelize/types/leaderboard'
import { Tracker } from '../../src/sequelize/types/tracker'
import { ReactionType, ReactionCount } from '../../src/sequelize/types/reaction'
import { normalizeEmoji } from '../../src/util/emoji'

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

    it('renders leaderboard with tracker reactions', () => {
        const lb: Leaderboard = {
            uuid: 'lb1',
            guildId: 'g',
            messageSnowflake: null,
            channelSnowflake: '123',
            deleteUserMessages: false,
            defaultTrackerTimeout: 0,
            defaultLeaderboardTrackerId: null
        }

        const tracker: Tracker = {
            uuid: 't1',
            guildId: 'g',
            name: 'stars',
            imageUrl: null,
            length: 3,
            reactionType: ReactionType.Emoji,
            reactionContent: normalizeEmoji('⭐'),
            displayBots: false,
            displayMissingUsers: false,
            recognizeSelfReactions: false,
            recognizeBotReactions: false
        }

        const reactions: ReactionCount[] = [
            { amount: 5, reacteeUserSnowflake: 'u1' },
            { amount: 3, reacteeUserSnowflake: 'u2' }
        ]

        const embed = new LeaderboardEmbed().getEmbed({
            leaderboard: lb,
            trackers: [tracker],
            trackerReactions: new Map([[tracker.uuid, reactions]])
        })

        expect(embed.data.title).toBe('⭐ Stars - Leaderboard')
        expect(embed.data.color).toBe(Colors.Gold)
        expect(embed.data.description).toContain('top 3 ⭐ earners')
        expect(embed.data.fields).toHaveLength(2)
        expect(embed.data.fields?.[0]?.name).toBe('1st.')
        expect(embed.data.fields?.[0]?.value).toBe('<@u1>\n⭐ - 5')
    })

    it('formats emojis correctly', () => {
        const lb: Leaderboard = {
            uuid: 'lb1',
            guildId: 'g',
            messageSnowflake: null,
            channelSnowflake: '123',
            deleteUserMessages: false,
            defaultTrackerTimeout: 0,
            defaultLeaderboardTrackerId: null
        }

        const built: Tracker = {
            uuid: 't1',
            guildId: 'g',
            name: 'built',
            imageUrl: null,
            length: 1,
            reactionType: ReactionType.Emoji,
            reactionContent: normalizeEmoji('⭐'),
            displayBots: false,
            displayMissingUsers: false,
            recognizeSelfReactions: false,
            recognizeBotReactions: false
        }

        const custom: Tracker = {
            uuid: 't2',
            guildId: 'g',
            name: 'custom',
            imageUrl: null,
            length: 1,
            reactionType: ReactionType.Custom,
            reactionContent: '123',
            displayBots: false,
            displayMissingUsers: false,
            recognizeSelfReactions: false,
            recognizeBotReactions: false
        }

        const animated: Tracker = {
            uuid: 't3',
            guildId: 'g',
            name: 'animated',
            imageUrl: null,
            length: 1,
            reactionType: ReactionType.CustomGIF,
            reactionContent: '999',
            displayBots: false,
            displayMissingUsers: false,
            recognizeSelfReactions: false,
            recognizeBotReactions: false
        }

        const embedBuilt = new LeaderboardEmbed().getEmbed({
            leaderboard: lb,
            trackers: [built],
            trackerReactions: new Map()
        })
        const embedCustom = new LeaderboardEmbed().getEmbed({
            leaderboard: lb,
            trackers: [custom],
            trackerReactions: new Map()
        })
        const embedAnimated = new LeaderboardEmbed().getEmbed({
            leaderboard: lb,
            trackers: [animated],
            trackerReactions: new Map()
        })

        expect(embedBuilt.data.title).toBe('⭐ Built - Leaderboard')
        expect(embedCustom.data.title).toBe('<:_:123> Custom - Leaderboard')
        expect(embedAnimated.data.title).toBe('<a:_:999> Animated - Leaderboard')
    })

    it('builds select components with defaults', () => {
        const lb: Leaderboard = {
            uuid: 'lb1',
            guildId: 'g',
            messageSnowflake: null,
            channelSnowflake: '123',
            deleteUserMessages: false,
            defaultTrackerTimeout: 0,
            defaultLeaderboardTrackerId: null
        }

        const t1: Tracker = {
            uuid: 't1',
            guildId: 'g',
            name: 'stars',
            imageUrl: null,
            length: 1,
            reactionType: ReactionType.Emoji,
            reactionContent: normalizeEmoji('⭐'),
            displayBots: false,
            displayMissingUsers: false,
            recognizeSelfReactions: false,
            recognizeBotReactions: false
        }

        const t2: Tracker = {
            uuid: 't2',
            guildId: 'g',
            name: 'hearts',
            imageUrl: null,
            length: 1,
            reactionType: ReactionType.Custom,
            reactionContent: '321',
            displayBots: false,
            displayMissingUsers: false,
            recognizeSelfReactions: false,
            recognizeBotReactions: false
        }

        const components = new LeaderboardEmbed().getComponents({
            leaderboard: lb,
            trackers: [t1, t2],
            selectedTrackerId: 't2'
        })

        expect(components).toHaveLength(1)
        const row: any = components[0].toJSON()
        const options = row.components[0].options
        expect(options).toHaveLength(2)
        expect(options[0].emoji?.name).toBe('⭐')
        expect(options[1].default).toBe(true)
    })

    it('nth helper returns ordinal suffixes', () => {
        const embed: any = new LeaderboardEmbed()
        expect(embed.nth(1)).toBe('1st')
        expect(embed.nth(2)).toBe('2nd')
        expect(embed.nth(3)).toBe('3rd')
        expect(embed.nth(4)).toBe('4th')
        expect(embed.nth(11)).toBe('11th')
        expect(embed.nth(21)).toBe('21st')
    })
})

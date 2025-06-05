import Welcome from '../../src/embeds/Welcome'
import { Colors } from 'discord.js'

describe('Welcome embed', () => {
    it('adds a thumbnail when avatar provided', () => {
        const embed = new Welcome().getEmbed('http://example.com/avatar.png')
        expect(embed.data.color).toBe(Colors.Gold)
        expect(embed.data.thumbnail?.url).toBe('http://example.com/avatar.png')
    })

    it('omits thumbnail when not provided', () => {
        const embed = new Welcome().getEmbed(undefined)
        expect(embed.data.thumbnail).toBeUndefined()
    })
})

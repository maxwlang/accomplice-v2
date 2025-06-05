import ApplicationCommandRateLimit from '../../src/embeds/ApplicationCommandRateLimit'
import { Colors } from 'discord.js'

describe('ApplicationCommandRateLimit embed', () => {
    it('builds a rate limit warning', () => {
        const embed = new ApplicationCommandRateLimit().getEmbed()
        expect(embed.data.title).toBe('Rate Limited')
        expect(embed.data.color).toBe(Colors.Red)
        expect(embed.data.description).toContain('rate limit')
    })
})

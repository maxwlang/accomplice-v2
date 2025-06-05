import SimpleEmbed from '../../src/embeds/SimpleEmbed'
import { Colors } from 'discord.js'

describe('SimpleEmbed', () => {
  it('builds an embed with provided options', () => {
    const embed = new SimpleEmbed('hi', { title: 't', color: Colors.Blue }).getEmbed()
    expect(embed.data.description).toBe('hi')
    expect(embed.data.title).toBe('t')
    expect(embed.data.color).toBe(Colors.Blue)
  })
})

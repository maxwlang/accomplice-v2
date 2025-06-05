import CommandsRegistered from '../../src/embeds/CommandsRegistered'
import { Colors } from 'discord.js'

describe('CommandsRegistered embed', () => {
  it('shows a success message', () => {
    const embed = new CommandsRegistered().getEmbed()
    expect(embed.data.title).toBe('Commands Registered')
    expect(embed.data.color).toBe(Colors.Green)
    expect(embed.data.description).toContain('successfully register')
  })
})

import SyncProgress from '../../src/embeds/SyncProgress'
import { Colors } from 'discord.js'

describe('SyncProgress embed', () => {
    it('shows progress update', () => {
        const embed = new SyncProgress().getEmbed({ progress: 1, total: 3 })
        expect(embed.data.title).toBe('Synchronization Progress')
        expect(embed.data.color).toBe(Colors.Blue)
        expect(embed.data.description).toContain('1')
        expect(embed.data.description).toContain('3')
    })

    it('shows completion state', () => {
        const embed = new SyncProgress().getEmbed({
            progress: 3,
            total: 3,
            done: true
        })
        expect(embed.data.title).toBe('Synchronization Complete')
        expect(embed.data.color).toBe(Colors.Green)
        expect(embed.data.description).toContain('3')
    })
})

import Embed from '../types/Embed'
import { EmbedBuilder } from 'discord.js'

export default class SyncProgress implements Embed {
    public getEmbed({
        progress,
        total,
        done
    }: {
        progress: number
        total: number
        done?: boolean
    }): EmbedBuilder {
        const embed = new EmbedBuilder()
            .setColor(done ? 'Green' : 'Blue')
            .setTimestamp()

        if (done) {
            embed
                .setTitle('Synchronization Complete')
                .setDescription(`Indexed ${progress} of ${total} chunks.`)
        } else {
            embed
                .setTitle('Synchronization Progress')
                .setDescription(`Indexed ${progress} of ${total} chunks...`)
        }

        return embed
    }

    public getComponents = (): null => null
}

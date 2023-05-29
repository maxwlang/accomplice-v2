import { EmbedBuilder } from 'discord.js'
import Embed from '../types/Embed'

export default class LeaderboardList implements Embed {
    public getEmbed(): EmbedBuilder {
        return new EmbedBuilder().setTitle('Test Thing').setDescription('Bruh!')
    }
}

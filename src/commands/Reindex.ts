import {
    ChatInputCommandInteraction,
    PermissionsBitField,
    SlashCommandBuilder
} from 'discord.js'
import Command from '../types/Command'

export default class ReindexCommand implements Command {
    public meta = new SlashCommandBuilder()
        .setName('reindex-leaderboard')
        .setDescription(
            'Re-indexes the entirety of guild messages for react data'
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)

    public execute = async ({
        interaction
    }: {
        interaction: ChatInputCommandInteraction
    }): Promise<void> => {
        await interaction.reply('Pong!')
        return
    }
}

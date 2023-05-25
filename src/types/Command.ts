import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder
} from 'discord.js'
import Accomplice from '../accomplice'

export default interface Command {
    meta: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder
    execute: ({
        interaction,
        bot
    }: {
        interaction: ChatInputCommandInteraction
        bot: Accomplice
    }) => Promise<void>
}

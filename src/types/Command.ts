import Accomplice from '../accomplice'

import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder
} from 'discord.js'

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

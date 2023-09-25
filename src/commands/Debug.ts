import Accomplice from '../accomplice'
import Command from '../types/Command'
// import Embed from '../types/Embed'
// import { basename } from 'path'
import { botAdminUserSnowflake } from '../config/discord'

import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    bold,
    codeBlock
} from 'discord.js'

// import { readdir } from 'fs/promises'

export default class DebugCommand implements Command {
    public meta = new SlashCommandBuilder()
        .setName('debug')
        .setDescription('A series of commands for debugging')
        .addSubcommand(subcommand =>
            subcommand
                .setName('show-timers')
                .setDescription('Shows all timers in memory')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear-timer')
                .setDescription('Clears a timer from memory')
                .addStringOption(option =>
                    option
                        .setName('timer-name')
                        .setDescription('The name of the timer to clear')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('eval')
                .setDescription('Evaluates a string of code')
                .addStringOption(option =>
                    option
                        .setName('code')
                        .setDescription('The code to evaluate')
                        .setRequired(true)
                )
                .addBooleanOption(option =>
                    option
                        .setName('handled')
                        .setDescription(
                            'Whether or not the code should be wrapped in a try/catch block (defaults to true)'
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('eval-sql')
                .setDescription('Evaluates a string of SQL')
                .addStringOption(option =>
                    option
                        .setName('sql')
                        .setDescription('The SQL to evaluate')
                        .setRequired(true)
                )
        )
    // .addSubcommand(subcommand =>
    //     subcommand
    //         .setName('list-embeds')
    //         .setDescription('Lists all embeds by name')
    // )
    // .addSubcommand(subcommand =>
    //     subcommand
    //         .setName('show-embed')
    //         .setDescription('Shows an embed')
    //         .addStringOption(option =>
    //             option
    //                 .setName('embed-name')
    //                 .setDescription('The name of the embed to show')
    //                 .setRequired(true)
    //         )
    // )

    public execute = async ({
        bot,
        interaction
    }: {
        bot: Accomplice
        interaction: ChatInputCommandInteraction
    }): Promise<void> => {
        if (interaction.user.id !== botAdminUserSnowflake) {
            await interaction.reply('You do not have permission to do this.')
            return
        }

        switch (interaction.options.getSubcommand()) {
            case 'show-timers':
                await this.showTimers(bot, interaction)
                break

            case 'clear-timer':
                await this.clearTimer(bot, interaction)
                break

            case 'eval':
                await this.eval(bot, interaction)
                break

            case 'eval-sql':
                await this.evalSql(bot, interaction)
                break

            // case 'list-embeds':
            //     await this.listEmbeds(bot, interaction)
            //     break

            // case 'show-embed':
            //     await this.showEmbed(bot, interaction)
            //     break

            default:
                await interaction.reply('Unhandled subcommand supplied.')
        }
    }

    public showTimers = async (
        bot: Accomplice,
        interaction: ChatInputCommandInteraction
    ): Promise<void> => {
        const timers = bot.timers
        if (timers.size === 0) {
            await interaction.reply('No timers in memory.')
            return
        }

        const timerList = Array.from(timers.keys())
            .map(timer => `- ${timer}`)
            .join('\n')

        await interaction.reply(
            `${bold('Active timers in memory:')}\n\n${codeBlock(timerList)}`
        )
    }

    public clearTimer = async (
        bot: Accomplice,
        interaction: ChatInputCommandInteraction
    ): Promise<void> => {
        const timerName = interaction.options.getString('timer-name', true)
        const timer = bot.timers.get(timerName)
        if (!timer) {
            await interaction.reply(`No timer found with name ${timerName}.`)
            return
        }

        clearTimeout(timer)
        bot.timers.delete(timerName)

        await interaction.reply(`Timer ${timerName} cleared.`)
    }

    public eval = async (
        _bot: Accomplice,
        interaction: ChatInputCommandInteraction
    ): Promise<void> => {
        const code = interaction.options.getString('code', true)
        const handled = interaction.options.getBoolean('handled') ?? true

        let result: unknown
        if (handled) {
            try {
                result = await eval(code)
            } catch (error) {
                result = error
            }
        } else {
            result = await eval(code)
        }

        await interaction
            .reply(`Result: ${codeBlock(`${result}`)}`)
            .catch(async e => {
                if (e.code === 50035) {
                    await interaction.followUp(
                        'Result is too long for Discord to handle and has been logged to the console'
                    )
                    console.log(result)
                }
            })
    }

    public evalSql = async (
        bot: Accomplice,
        interaction: ChatInputCommandInteraction
    ): Promise<void> => {
        const sql = interaction.options.getString('sql', true)

        const result = await bot.sequelize.query(sql, {
            type: 'SELECT'
        })

        await interaction
            .reply(
                `Result:\n${codeBlock(`${JSON.stringify(result, null, 2)}`)}`
            )
            .catch(async e => {
                try {
                    if (e.code === 50035) {
                        await interaction.followUp(
                            `Result:\n${codeBlock(`${JSON.stringify(result)}`)}`
                        )
                    }

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (e2: any) {
                    if (e2.code === 50035) {
                        await interaction.followUp(
                            'Result is too long for Discord to handle and has been logged to the console'
                        )
                        console.log(result)
                    }
                }
            })
    }

    // public listEmbeds = async (
    //     _bot: Accomplice,
    //     interaction: ChatInputCommandInteraction
    // ): Promise<void> => {
    //     const embedFiles = await readdir('./dist/embeds').then(
    //         (files: string[]) => files.filter(file => file.endsWith('.js'))
    //     )

    //     const embeds = await embedFiles.map(async embedFile => {
    //         const EmbedClass = (await import(`./dist/embeds/${embedFile}`))
    //             .default
    //         const embedInstance: Embed = new EmbedClass()
    //         const embed = await embedInstance.getEmbed()
    //         return `- ${embedFile.split('.')[0]} - ${
    //             embed.data.title ?? 'No Title'
    //         } - ${embed.data.description ?? 'No Description'}`
    //     })

    //     if (embeds.length === 0) {
    //         await interaction.reply('No embeds found.')
    //         return
    //     }

    //     const embedList = embeds.join('\n')

    //     await interaction.reply(`${bold('Embeds:')}\n${codeBlock(embedList)}`)
    // }

    // public showEmbed = async (
    //     _bot: Accomplice,
    //     interaction: ChatInputCommandInteraction
    // ): Promise<void> => {
    //     const embedName = basename(
    //         interaction.options.getString('embed-name', true)
    //     )

    //     try {
    //         const EmbedClass = (await import(`./dist/embeds/${embedName}.js`))
    //             .default
    //         const embedInstance: Embed = new EmbedClass()
    //         const embed = await embedInstance.getEmbed()
    //         await interaction.reply({ embeds: [embed] })
    //     } catch (e) {
    //         await interaction.reply(`No embed found with name ${embedName}.`)
    //     }
    // }
}

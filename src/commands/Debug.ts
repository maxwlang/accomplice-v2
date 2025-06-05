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
import SimpleEmbed from '../embeds/SimpleEmbed'

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
        .addSubcommand(subcommand =>
            subcommand
                .setName('show-stats')
                .setDescription('Shows stats about the bot')
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
            const embed = new SimpleEmbed(
                'You do not have permission to do this.',
                {
                    color: 'Red',
                    title: 'Permission Denied'
                }
            ).getEmbed()
            await interaction.reply({ embeds: [embed] })
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

            case 'show-stats':
                await this.showStats(bot, interaction)
                break

            default:
                await interaction.reply({
                    embeds: [
                        new SimpleEmbed('Unhandled subcommand supplied.', {
                            color: 'Red',
                            title: 'Error'
                        }).getEmbed()
                    ]
                })
        }
    }

    public showTimers = async (
        bot: Accomplice,
        interaction: ChatInputCommandInteraction
    ): Promise<void> => {
        const timers = bot.timers
        if (timers.size === 0) {
            await interaction.reply({
                embeds: [
                    new SimpleEmbed('No timers in memory.', {
                        color: 'Orange',
                        title: 'Timers'
                    }).getEmbed()
                ]
            })
            return
        }

        const timerList = Array.from(timers.keys())
            .map(timer => `- ${timer}`)
            .join('\n')

        await interaction.reply({
            embeds: [
                new SimpleEmbed(
                    `${bold('Active timers in memory:')}\n\n${codeBlock(
                        timerList
                    )}`,
                    { title: 'Timers', color: 'Blue' }
                ).getEmbed()
            ]
        })
    }

    public clearTimer = async (
        bot: Accomplice,
        interaction: ChatInputCommandInteraction
    ): Promise<void> => {
        const timerName = interaction.options.getString('timer-name', true)
        const timer = bot.timers.get(timerName)
        if (!timer) {
            await interaction.reply({
                embeds: [
                    new SimpleEmbed(`No timer found with name ${timerName}.`, {
                        color: 'Orange',
                        title: 'Timer'
                    }).getEmbed()
                ]
            })
            return
        }

        clearTimeout(timer)
        bot.timers.delete(timerName)

        await interaction.reply({
            embeds: [
                new SimpleEmbed(`Timer ${timerName} cleared.`, {
                    color: 'Green',
                    title: 'Timer'
                }).getEmbed()
            ]
        })
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
            .reply({
                embeds: [
                    new SimpleEmbed(`Result: ${codeBlock(`${result}`)}`, {
                        color: 'Blue',
                        title: 'Eval'
                    }).getEmbed()
                ]
            })
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
            .reply({
                embeds: [
                    new SimpleEmbed(
                        `Result:\n${codeBlock(
                            `${JSON.stringify(result, null, 2)}`
                        )}`,
                        { title: 'SQL Result', color: 'Blue' }
                    ).getEmbed()
                ]
            })
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
    //     const embedFiles = await readdir('./dist/src/embeds').then(
    //         (files: string[]) => files.filter(file => file.endsWith('.js'))
    //     )

    //     const embeds = await embedFiles.map(async embedFile => {
    //         const EmbedClass = (await import(`./dist/src/embeds/${embedFile}`))
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
    //         const EmbedClass = (await import(`./dist/src/embeds/${embedName}.js`))
    //             .default
    //         const embedInstance: Embed = new EmbedClass()
    //         const embed = await embedInstance.getEmbed()
    //         await interaction.reply({ embeds: [embed] })
    //     } catch (e) {
    //         await interaction.reply(`No embed found with name ${embedName}.`)
    //     }
    // }

    public showStats = async (
        bot: Accomplice,
        interaction: ChatInputCommandInteraction
    ): Promise<void> => {
        const { Starboard, Leaderboard, User, Reaction } = bot.sequelize.models
        const guildCount = bot.guilds.cache.size
        const channelCount = bot.channels.cache.size
        const userCount = bot.users.cache.size
        const starboardCount = await Starboard.count()
        const leaderboardCount = await Leaderboard.count()
        const reactingUserCount = await User.count()
        const reactionCount = await Reaction.count()

        let statsMessage = `${bold('Guilds:')} ${guildCount}\n`
        statsMessage += `${bold('Channels:')} ${channelCount}\n`
        statsMessage += `${bold('Users:')} ${userCount}\n`
        statsMessage += `${bold('Starboards:')} ${starboardCount}\n`
        statsMessage += `${bold('Leaderboards:')} ${leaderboardCount}\n`
        statsMessage += `${bold('Reacting Users:')} ${reactingUserCount}\n`
        statsMessage += `${bold('Reactions:')} ${reactionCount}`

        await interaction.reply({
            embeds: [
                new SimpleEmbed(statsMessage, {
                    title: 'Stats',
                    color: 'Blue'
                }).getEmbed()
            ]
        })
    }
}

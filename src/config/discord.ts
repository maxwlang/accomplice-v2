import { OAuth2Scopes, PermissionFlagsBits } from 'discord.js'

export const token = process.env['DISCORD_TOKEN']

export const avatarDisplayName =
    process.env['DISCORD_DISPLAY_NAME'] || 'Accomplice'

export const activityRefreshInterval =
    (process.env['DISCORD_ACTIVITY_REFRESH_INTERVAL']
        ? +process.env['DISCORD_ACTIVITY_REFRESH_INTERVAL']
        : 60) * 1000

export const botAdminUserSnowflake =
    process.env['DISCORD_BOT_ADMIN_SNOWFLAKE'] ?? '707022657354203180'

export const requiredPermissions: (typeof PermissionFlagsBits)[keyof typeof PermissionFlagsBits][] =
    [
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.SendMessagesInThreads,
        PermissionFlagsBits.ManageMessages,
        PermissionFlagsBits.AddReactions,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.UseApplicationCommands,
        PermissionFlagsBits.UseExternalEmojis,
        PermissionFlagsBits.ViewChannel
    ]

export const requiredScopes: OAuth2Scopes[] = [OAuth2Scopes.Bot]

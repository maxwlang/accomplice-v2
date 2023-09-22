export const token = process.env['DISCORD_TOKEN']

export const avatarDisplayName =
    process.env['DISCORD_DISPLAY_NAME'] || 'Accomplice'

export const activityRefreshInterval =
    (process.env['DISCORD_ACTIVITY_REFRESH_INTERVAL']
        ? +process.env['DISCORD_ACTIVITY_REFRESH_INTERVAL']
        : 60) * 1000

export const botAdminUserSnowflake =
    process.env['DISCORD_BOT_ADMIN_SNOWFLAKE'] ?? '707022657354203180'

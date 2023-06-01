export const token =
    process.env['DISCORD_TOKEN'] ||
    'MTA0NTE1MDc2OTM4MjQyNDU4Ng.G-b-f5.FYvO7sRjsBGxDE1ZJqsKcFQ7CKiR0-NtWaNYuY'
// 'NzMzOTI5MDU0OTMxMjU1MzI3.GNfX7W.solZTu9NpyPiDrNcv031EHkGqqsGaAfqwRsQUM'

export const avatarDisplayName =
    process.env['DISCORD_DISPLAY_NAME'] || 'Accomplice'

export const activityRefreshInterval =
    (process.env['DISCORD_ACTIVITY_REFRESH_INTERVAL']
        ? +process.env['DISCORD_ACTIVITY_REFRESH_INTERVAL']
        : 60) * 1000

export const botAdminUserSnowflake =
    process.env['DISCORD_BOT_ADMIN_SNOWFLAKE'] ?? '707022657354203180'

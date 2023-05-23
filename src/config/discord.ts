export const token =
    process.env['DISCORD_TOKEN'] ||
    'MTA0NTE1MDc2OTM4MjQyNDU4Ng.G-b-f5.FYvO7sRjsBGxDE1ZJqsKcFQ7CKiR0-NtWaNYuY'

export const avatarUrl = process.env['DISCORD_AVATAR_URL']
export const avatarDisplayName =
    process.env['DISCORD_DISPLAY_NAME'] || 'Accomplice V2'

export const activityRefreshInterval =
    (process.env['DISCORD_ACTIVITY_REFRESH_INTERVAL']
        ? +process.env['DISCORD_ACTIVITY_REFRESH_INTERVAL']
        : 60) * 1000

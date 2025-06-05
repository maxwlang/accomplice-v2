export const messageSyncLimit = process.env['MESSAGE_SYNC_LIMIT']
    ? +process.env['MESSAGE_SYNC_LIMIT']
    : 50_000

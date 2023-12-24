import { avatarDisplayName } from '../config/discord'
import { logLevel } from '../config/winston'
import { mkdir } from 'fs/promises'

import { createLogger, format, transports } from 'winston'
const { combine, colorize, printf, timestamp } = format

const logger = createLogger({
    level: logLevel,
    format: format.json(),
    transports: ((): Array<
        transports.FileTransportInstance | transports.ConsoleTransportInstance
    > => {
        const transportStorage: Array<
            | transports.FileTransportInstance
            | transports.ConsoleTransportInstance
        > = []

        if (process.env['LOG_TO_FILE'] === 'true') {
            mkdir('./data')
                .finally(() => {
                    transportStorage.push(
                        new transports.File({ filename: './data/logs.log' })
                    )
                })
                .catch()
        }

        // Always log to console
        transportStorage.push(
            new transports.Console({
                format: combine(
                    colorize(),
                    timestamp({ format: 'MM/DD/YYYY hh:mm:ss A' }),
                    printf(
                        ({ timestamp, level, message }) =>
                            `[${timestamp}][${avatarDisplayName}][${level}]: ${message}`
                    )
                )
            })
        )

        return transportStorage
    })()
})

export default logger

const discordEpoch = 1420070400000

export function snowflakeToDate(snowflake: string | number | bigint): Date {
    if (typeof snowflake === 'string' || typeof snowflake === 'number') {
        snowflake = BigInt(snowflake)
    }

    const milliseconds = snowflake >> 22n
    return new Date(Number(milliseconds) + discordEpoch)
}

export function dateToSnowflake(date: Date): bigint {
    const milliseconds = BigInt(date.getTime() - discordEpoch)
    const snowflake = milliseconds << 22n
    return snowflake
}

// const snowflake = 1112547286166290533n
// const dateFrom = snowflakeToDate(snowflake)
// console.log(dateFrom.toLocaleString('EN-US'))
// const snowflakeFrom = dateToSnowflake(dateFrom)
// console.log(snowflake - snowflakeFrom)

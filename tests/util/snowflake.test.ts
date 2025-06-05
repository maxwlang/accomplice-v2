import { dateToSnowflake, snowflakeToDate } from '../../src/util/snowflake'

describe('snowflake converters', () => {
  it('converts date to snowflake and back', () => {
    const date = new Date('2023-01-01T00:00:00Z')
    const snowflake = dateToSnowflake(date)
    const result = snowflakeToDate(snowflake)
    expect(result.toISOString()).toBe(date.toISOString())
  })

  it('handles string snowflake input', () => {
    const date = new Date('2023-05-17T12:34:56Z')
    const snowflake = dateToSnowflake(date)
    const result = snowflakeToDate(snowflake.toString())
    expect(result.toISOString()).toBe(date.toISOString())
  })
})

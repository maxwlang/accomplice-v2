import Accomplice from './accomplice'
import db from './sequelize/models'
import fs from 'fs'
import logger from './modules/logger'
;(async (): Promise<void> => {
    try {
        logger.info('Loading database..')
        await db.sequelize.authenticate()

        if (!fs.existsSync('./data')) fs.mkdirSync('./data')

        if (process.env['INIT_DB'] === 'true') {
            await db.sequelize.sync({ force: true })
            fs.writeFileSync(
                './data/.db-initialized',
                new Date().getTime().toString(),
                'utf-8'
            )
        }

        const { Guild, Starboard, Leaderboard, User } = db.sequelize.models

        logger.info(
            `Database stats\n------------------------\n| ${await Guild.count()} guilds | ${await Starboard.count()} starboards |\n| ${await Leaderboard.count()} leaderboards | ${await User.count()} users |\n------------------------`
        )

        logger.info('Loading bot..')
        const accomplice = new Accomplice({
            logger,
            sequelize: db.sequelize
        })

        await accomplice.start()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        logger.error(e.toString())
    }
})()

import logger from './modules/logger'
import Accomplice from './accomplice'
import db from './sequelize/models'
import fs from 'fs'
;(async (): Promise<void> => {
    try {
        logger.info('Loading database..')
        await db.sequelize.authenticate()

        if (!fs.existsSync('./data')) fs.mkdirSync('./data')

        if (!fs.existsSync('./data/.db-initialized')) {
            await db.sequelize.sync({ force: true })
            fs.writeFileSync('./data/.db-initialized', '', 'utf-8')
        }

        const { Guild, Starboard, Leaderboard, User } = db.sequelize.models
        console.log(db.sequelize.models.User)

        logger.info(
            `Database stats\n------------------------\n| ${await Guild.count()} guilds | ${await Starboard.count()} starboards |\n| ${await Leaderboard.count()} leaderboards | ${await User.count()} users |\n------------------------`
            // `| ${await Leaderboard.count()} | ${await User.count()} users`
        )

        logger.info('Loading bot..')
        const accomplice = new Accomplice({
            logger
        })

        await accomplice.start()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        logger.error(e.toString())
    }
})()

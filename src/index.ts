import logger from './modules/logger'
import Accomplice from './accomplice'
import db from './sequelize/models'
;(async (): Promise<void> => {
    try {
        logger.info('Loading database..')
        await db.sequelize.authenticate()

        // const { User_Reacts, User, Emote } = db.sequelize.models
        // logger.info(
        //     `Loaded ${await Emote.count()} emotes, ${await User_Reacts.count()} reacts, and ${await User.count()} users.`
        // )

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

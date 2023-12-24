'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Leaderboard extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Leaderboard.init(
        {
            uuid: { type: DataTypes.UUID, unique: true, allowNull: false },
            guildId: { type: DataTypes.UUID, allowNull: false },
            channelSnowflake: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false
            }, // There may only be one leaderboard per channel, but there may be multiple trackers
            deleteUserMessages: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            defaultTrackerTimeout: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 120
            },
            messageSnowflake: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: true
            },
            defaultLeaderboardTrackerId: {
                type: DataTypes.UUID,
                allowNull: true
            }
        },
        {
            sequelize,
            modelName: 'Leaderboard'
        }
    )
    return Leaderboard
}

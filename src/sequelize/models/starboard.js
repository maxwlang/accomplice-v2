'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Starboard extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Starboard.init(
        {
            uuid: { type: DataTypes.UUID, unique: true, allowNull: false },
            guildId: { type: DataTypes.UUID, unique: true, allowNull: false },
            name: { type: DataTypes.STRING, allowNull: true }, // Unique per-guild, not a unique column
            channelSnowflake: {
                // Not unique, a channel may have multiple boards
                type: DataTypes.STRING,
                allowNull: false
            },
            monitorChannelSnowflake: {
                // Not unique, a channel may be monitored by multiple boards
                type: DataTypes.STRING,
                allowNull: true
            },
            allowBotReacts: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            allowReactedBots: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            minimumReacts: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 3
            },
            removalThreshold: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            react: {
                type: DataTypes.STRING,
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: 'Starboard'
        }
    )
    return Starboard
}

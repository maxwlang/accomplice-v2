'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class LeaderboardTrackers extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    LeaderboardTrackers.init(
        {
            uuid: { type: DataTypes.UUID, unique: true, allowNull: false },
            guildId: { type: DataTypes.UUID, allowNull: false },
            leaderboardId: { type: DataTypes.UUID, allowNull: false },
            trackerId: { type: DataTypes.UUID, allowNull: false, unique: true } // A tracker may only exist on one leaderboard
        },
        {
            sequelize,
            modelName: 'LeaderboardTrackers'
        }
    )
    return LeaderboardTrackers
}

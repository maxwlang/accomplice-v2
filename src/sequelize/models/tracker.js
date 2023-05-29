'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Tracker extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Tracker.init(
        {
            uuid: { type: DataTypes.UUID, unique: true },
            name: { type: DataTypes.STRING, allowNull: true }, // Unique per-guild, not a unique column
            maxEntries: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 10
            },

            // At least one of these needs to be provided:
            reactionType: { type: DataTypes.STRING, allowNull: true },
            reactionContent: { type: DataTypes.STRING, allowNull: true },
            reacteeUserId: { type: DataTypes.STRING, allowNull: true },
            reactorUserId: { type: DataTypes.STRING, allowNull: true }
        },
        {
            sequelize,
            modelName: 'Tracker'
        }
    )
    return Tracker
}

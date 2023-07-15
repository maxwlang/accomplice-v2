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
            guildId: { type: DataTypes.UUID, allowNull: false },
            name: { type: DataTypes.STRING, allowNull: false },
            imageUrl: { type: DataTypes.STRING, allowNull: true },
            length: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            reactionType: { type: DataTypes.STRING, allowNull: true },

            // At least one of these needs to be provided:
            reactionContent: { type: DataTypes.STRING, allowNull: true } // Tracking by content
            // reacteeUserId: { type: DataTypes.STRING, allowNull: true }, // For tracking by users
            // reactorUserId: { type: DataTypes.STRING, allowNull: true } // For tracking by users
            // introduce a trackedContent field instead.
        },
        {
            sequelize,
            modelName: 'Tracker'
        }
    )
    return Tracker
}

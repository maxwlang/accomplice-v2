'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Reaction extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Reaction.init(
        {
            uuid: { type: DataTypes.UUID, unique: true, allowNull: false },
            type: { type: DataTypes.STRING, allowNull: false }, // Enum, Emoji, Custom, CustomGIF, CustomSuper, CustomSuperGif
            content: { type: DataTypes.STRING, allowNull: false },
            id: { type: DataTypes.STRING, allowNull: true },
            reacteeUserId: { type: DataTypes.UUID, allowNull: false },
            reactorUserId: { type: DataTypes.UUID, allowNull: false }
        },
        {
            sequelize,
            modelName: 'Reaction'
        }
    )
    return Reaction
}

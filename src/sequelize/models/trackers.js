'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Trackers extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Trackers.init(
        {
            uuid: { type: DataTypes.UUID, unique: true },
            name: { type: DataTypes.STRING, allowNull: true }, // Unique per-guild, not a unique column
            react: { type: DataTypes.STRING, allowNull: false }
        },
        {
            sequelize,
            modelName: 'Trackers'
        }
    )
    return Trackers
}

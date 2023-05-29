'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class GuildUsers extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    GuildUsers.init(
        {
            uuid: { type: DataTypes.UUID, unique: true, allowNull: false },
            guildId: { type: DataTypes.UUID, allowNull: false },
            userId: { type: DataTypes.UUID, allowNull: false }
        },
        {
            sequelize,
            modelName: 'GuildUsers'
        }
    )
    return GuildUsers
}

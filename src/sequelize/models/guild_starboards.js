'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class GuildStarboards extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    GuildStarboards.init(
        {
            uuid: { type: DataTypes.UUID, unique: true, allowNull: false },
            guildId: { type: DataTypes.STRING, allowNull: false },
            starboardId: {
                // A starboard my only exist on one guild
                type: DataTypes.UUID,
                unique: true,
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: 'GuildStarboards'
        }
    )
    return GuildStarboards
}

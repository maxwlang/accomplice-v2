'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class GuildReactions extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    GuildReactions.init(
        {
            uuid: { type: DataTypes.UUID, unique: true, allowNull: false },
            guildId: { type: DataTypes.UUID, allowNull: false },
            reactionId: {
                // Reactions are unique to each guild
                type: DataTypes.UUID,
                unique: true,
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: 'GuildReactions'
        }
    )
    return GuildReactions
}

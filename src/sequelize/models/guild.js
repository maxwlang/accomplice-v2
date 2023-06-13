'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class Guild extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Guild.init(
        {
            uuid: { type: DataTypes.UUID, unique: true, allowNull: false },
            snowflake: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false
            },
            isPriority: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            commandsState: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: {}
            }
        },
        {
            sequelize,
            modelName: 'Guild'
        }
    )
    return Guild
}

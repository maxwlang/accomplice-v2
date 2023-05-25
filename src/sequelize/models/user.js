'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    User.init(
        {
            uuid: { type: DataTypes.UUID, unique: true, allowNull: false },
            snowflake: {
                type: DataTypes.STRING,
                unique: true,
                allowNull: false
            },
            isBot: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false
            }
        },
        {
            sequelize,
            modelName: 'User'
        }
    )
    return User
}

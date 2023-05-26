'use strict'

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const basename = path.basename(__filename)
const env =
    process.env['NODE_ENV'] === 'production' ? 'production' : 'development'
const config = require(__dirname + '/../config/sequelize.json')[env]
const db = {}

const sequelize = new Sequelize(config)

fs.readdirSync(__dirname)
    .filter(file => {
        console.log({ file })
        return (
            file.indexOf('.') !== 0 &&
            file !== basename &&
            file.slice(-3) === '.js'
        )
    })
    .forEach(file => {
        console.log({ file2: file })
        const model = require(path.join(__dirname, file))(
            sequelize,
            Sequelize.DataTypes
        )
        db[model.name] = model
    })

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db)
    }
})

db.sequelize = sequelize

module.exports = db

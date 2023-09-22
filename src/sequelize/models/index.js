'use strict'

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const basename = path.basename(__filename)
const dbenv = process.env['DB_ENV']
// const config = require(__dirname + '/../config/sequelize.json')[env]
const dbOpts = {
    production: {
        dialect: process.env['DB_PROD_DIALECT'],
        host: process.env['DB_PROD_HOST'],
        port: process.env['DB_PROD_PORT'],
        username: process.env['DB_PROD_USERNAME'],
        password: process.env['DB_PROD_PASSWORD'],
        database: process.env['DB_PROD_DATABASE'],
        logging: false
    },
    development: {
        dialect: process.env['DB_DEV_DIALECT'],
        host: process.env['DB_DEV_HOST'],
        port: process.env['DB_DEV_PORT'],
        username: process.env['DB_DEV_USERNAME'],
        password: process.env['DB_DEV_PASSWORD'],
        database: process.env['DB_DEV_DATABASE'],
        logging: true
    }
}

const config = dbOpts[dbenv]
const db = {}

const sequelize = new Sequelize(config)

fs.readdirSync(__dirname)
    .filter(file => {
        return (
            file.indexOf('.') !== 0 &&
            file !== basename &&
            file.slice(-3) === '.js'
        )
    })
    .forEach(file => {
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

'use strict';

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];

let uri = 'mongodb+srv://'+config.username+':'+config.password+'@'+config.server+'.'+config.host+'/'+config.database+'?retryWrites=true&w=majority';
console.log(uri)

mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
let models = {}

const db = mongoose.connection;
db.on('open', () => {
	console.log("Database connection acquired.");
})

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file));
    models[model.modelName] = model;
  });

module.exports = models;

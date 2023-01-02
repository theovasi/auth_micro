"use strict";

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const VAULT_ADDR = process.env.VAULT_ADDR;
const VAULT_NAMESPACE = process.env.VAULT_NAMESPACE;


let vaultToken;
var details = {
    'role_id': '0895cf43-1b4f-ee7b-48c2-5997118572eb',
    'secret_id': 'd193002f-94bf-b442-0873-7263e5ebf8be'
};

var formBody = [];
for (var property in details) {
  var encodedKey = encodeURIComponent(property);
  var encodedValue = encodeURIComponent(details[property]);
  formBody.push(encodedKey + "=" + encodedValue);
}
formBody = formBody.join("&");

fetch(VAULT_ADDR + '/v1/auth/approle/login', {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'X-Vault-Namespace': 'admin'
  },
  body: formBody,
  method: 'POST'
}).then(res => res.json()).then((data) => {
  vaultToken = data.auth.client_token;
  buildMongoDBUri().then((uri) => {
    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  });
});

async function buildMongoDBUri() {
  let databaseConfig = await fetch(VAULT_ADDR + '/v1/secret/data/database', {
    headers: {
      'X-Vault-Token': vaultToken,
      'X-Vault-Namespace': VAULT_NAMESPACE
    },
    method: 'GET'
  }).then(res => res.json()).then((data) => {
   return data.data.data;
  })
  let uri = "mongodb+srv://" +
    databaseConfig.username +
    ":" +
    databaseConfig.password +
    "@" +
    databaseConfig.server +
    "." +
    databaseConfig.host +
    "/" +
    databaseConfig.database +
    "?retryWrites=true&w=majority";

  return uri
}

let models = {};

const db = mongoose.connection;
db.on("open", () => {
  console.log("Database connection acquired.");
});

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file));
    models[model.modelName] = model;
  });

module.exports = models;

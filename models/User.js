"use strict";
const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  username: String,
  email: String,
  password: String,
  salt: String,
});

const User = model("User", userSchema);

module.exports = User;

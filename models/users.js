'use strict'

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Users Schema
const Schema = mongoose.Schema;
const usersSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    ebayauthtoken: {
        type: String,
        required: false
    },
    ebayreftoken: {
        type: String,
        required: false
    }
});

const users = mongoose.model('Users', usersSchema);

module.exports = users;

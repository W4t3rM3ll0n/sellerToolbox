'use strict'

const mongoose = require('mongoose');

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
    addresses: {
        type: [{
            company: String,
            name: String,
            address1: {
                type: String,
                required: true
            },
            address2: String,
            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            zip: {
                type: String,
                required: true
            },
            country: String,
            primary: Boolean,
            fullAddress: String
        }]
    },
    tokens: {
        ebayauthtoken: {
            type: String,
            required: false
        },
        ebayreftoken: {
            type: String,
            required: false
        },
        pitneyBowesAuthToken: String

    }
});

const users = mongoose.model('Users', usersSchema);

module.exports = users;

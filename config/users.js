'use strict'

const bcrypt = require('bcryptjs');

const Users = require('../models/users');

module.exports = {
    
    addUser: (regUser, callback) => {
        // Begin registering and hashing of password
        bcrypt.genSalt(10, (err, saltRounds) => {
            bcrypt.hash(regUser.password, saltRounds, (err, hash) => {
                if (err) throw err;
                // hash the password from regUser
                regUser.password = hash;
                // Create New User
                let newUser = Users(regUser);
                newUser.save(callback)
            });
        });
    },

    getUserByUsername: (username, callback) => {
        const query = {username: username}
        Users.findOne(query, callback);
    },

    // This is not in use.
    getUserById: (user, callback) => {
        Users.find(user, callback);
    },

    comparePassword: (candidatePassword, hash, callback) => {
        bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
            if(err) throw err;
            callback(null, isMatch);
        });
    },

    updateUser: (user, updateUser, callback) => {
        // Update Existing User
        Users.findByIdAndUpdate(user.id, updateUser).exec()
            .then((updated) => {
                callback(null, updated);

            }).catch((err) => {
                callback(err, null);

        });
    },

    updatePassword: (user, updatePassword, callback) => {

        bcrypt.genSalt(10, (err, saltRounds) => {
            bcrypt.hash(updatePassword.password, saltRounds, (err, hash) => {
                if (err) throw err;
                // hash the password from regUser
                updatePassword.password = hash;
                // Update the password
                Users.findByIdAndUpdate(user.id, updatePassword).exec()
                .then((updated) => {
                    callback(null, updated);
    
                }).catch((err) => {
                    callback(err, null);
    
                });
            });
        });
    },

    deleteUser: (user, callback) => {
        // In order to find(), the entire object is expected as a parameter.
        Users.find(user).remove().exec()
            .then((deleted) => {
                callback(null, deleted);
        }).catch((err) => {
            callback(err, null);
        });
    },

}

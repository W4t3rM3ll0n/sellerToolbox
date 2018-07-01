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

    addUpdateAddress(address, userId, callback) {

        const updateList = [];
        const newList = [];

        // Split the addresses submitted with the [newList] and [updateList]. newList === New Addresses, updateList === Existing Addresses.
        const organize = () => {
            return new Promise((resolve, reject) => {
                if(this === null) { 
                    reject();
                } else {
                    address.map((item) => {
                        if(item.id === '') {
                            newList.push(item);
                        } else {
                            updateList.push(item);
                        }
                        resolve();
                    });
                }
            });
        }

        // Update and existing addresses that has been submitted.
        const updateAddress = () => {
            return new Promise((resolve, reject) => {
                // Update addresses for user account
                Users.findById({_id: userId})
                    .then(() => {
                        Users.update({_id: userId}, { $set: { addresses: [...updateList] } }, (err, updated) => {
                            err ? reject(err) : resolve(updated);
                        });
                    })
                .catch(err => reject(err));
            });
        }       
        
        // Add new addresses if any were submitted. Add the [newList].length + the length of how many are in the database. Then limit it to 5.
        const addNewAddress = (chain) => {
            return new Promise((resolve, reject) => {
                // Add addresses for user account
                Users.findById({_id: userId})
                    .then((data) => {
                        if(newList.length + data.addresses.length <= 5) {
                            Users.update({_id: userId}, { $push: { addresses: { $each: newList }}}, (err, added) => {
                                err ? reject(err) : resolve(JSON.stringify(chain)+ ' ' +JSON.stringify(added));
                            });
                        } else {
                            reject('Can only have up to 5 addresses');
                        }
                    })
                .catch(err => reject(err));
            });
        }

        organize()
            .then(() => {
                if(updateList.length > 0) {
                    return updateAddress();
                }
            })
            .then((result) => {
                if(newList.length > 0) {
                    return addNewAddress(result);
                } else {
                    return JSON.stringify(result);
                }
            })
            .then((done) => {
                callback(null, done);
            })
        .catch(err => callback(err, null));

    },

    deleteAddress: (callback) => {
        callback(null, 'delete address config function working');
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

    deleteUser: (userId, callback) => {
        // In order to find(), the entire object is expected as a parameter.
        Users.find({_id: userId}).remove().exec()
            .then((deleted) => {
                callback(null, deleted);
        }).catch((err) => {
            callback(err, null);
        });
    },

}

'use strict'

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');

const Users = require('../models/users');
const configDB = require('../config/database');
const configUsers = require('../config/users');

// Login/Register Setup
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/************************************/
/***** LOGIN, REGISTER & UPDATE *****/
/************************************/

// Root /users
router.get('/', (req, res, next) => {
    configUsers.getUserById()
    res.send('Nothing to see here');
    
});

// /users/register GET
router.get('/profile', passport.authenticate('jwt', { session:false }), (req, res, next) => {
    res.json({user: req.user});
    
});

// /users/getAuthToken, This gets the ebay Auth and Refresh tokens. 
// This may not be needed anymore. We no longer want to send sensitive information to the client
router.get('/getAuth', passport.authenticate('jwt', { session:false }), (req, res, next) => {
    res.json({authTk: req.user.ebayauthtoken, refTk: req.user.ebayreftoken});
    
});

// /users/register POST
router.post('/register', (req, res, next) => {
    let regUser = {
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        ebayauthtoken: '',
        ebayreftoken: ''
    }

    configUsers.addUser(regUser, (err, user) => {
        err ? res.json({success: false, msg:'Failed to register user'}) : res.json({success: true, msg:'User registered'});
    });

});

// /users/authenticate POST
router.post('/authenticate', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    configUsers.getUserByUsername(username, (err, user) => {
        if(err) throw err;

        if(!user) {
            return res.json({success: false, msg: 'User was not found.'});
        }

        configUsers.comparePassword(password, user.password, (err, isMatch) => {
            if(err) throw err;

            if(isMatch) {
                const token = jwt.sign({ data: user }, configDB.getDbConnectionString().secret, {
                    expiresIn: 604800 // 1 week
                });

                res.json({
                    success: true,
                    token: 'Bearer ' +token,
                    user: {
                        id: user._id,
                        name: user.name,
                        username: user.username,
                        email: user.email
                    }
                })
            } else {
                return res.json({success: false, msg: 'Wrong password.'});
            }
        });
    });
});

// /users/update
router.post('/update', passport.authenticate('jwt', { session:false }), (req, res, next) => {
    const updateUser = {
        name: req.body.updateUser.name,
        username: req.body.updateUser.username,
        email: req.body.updateUser.email
    }
    const user = req.user;
    // console.log(updateUser);
    
    configUsers.updateUser(user, updateUser, (err, user) => {
        err ? res.json({success: false, msg:'Failed to update user: ' + err}) : res.json({success: true, msg:'User has been updated'});

    });

});

// /users/updatepw PASSWORD
router.post('/updatepw', passport.authenticate('jwt', { session:false }), (req, res, next) => {

    const user = req.user;
    const password = req.body.passwords.password;
    const updateUser = {
        password: req.body.passwords.newPassword
    }

    configUsers.getUserByUsername(user.username, (err, user) => {
        if(err) throw err;

        if(!user) {
            return res.json({success: false, msg: 'User was not found.'});
        }

        configUsers.comparePassword(password, user.password, (err, isMatch) => {
            if(err) throw err;

            if(isMatch) {
                configUsers.updatePassword(user, updateUser, (err, updated) => {
                    err ? res.json({success: false, msg: 'Your password was not able to update.'}) : res.json({success: true, msg: 'Your password has been updated.'});

                });

            } else {
                return res.json({success: false, msg: 'Wrong password.'});
            }
        });
    });
    
});

router.delete('/deleteUser', passport.authenticate('jwt', { session:false }), (req, res, next) => {

    // We pass in the entire user object
    const user = req.user

    configUsers.deleteUser(user, (err, deleted) => {
        err ? res.json({success: false, msg:'Failed to delete user: ' + err}) : res.json({success: true, msg:'User has been deleted'});
    });

});

/****************************/
/***** SETUP SEED DATA *****/
/****************************/

// Configure a seed data setup route

module.exports = router;

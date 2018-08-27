'use strict'
// Dependencies
const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const configDB = require('../config/database');
const configUsers = require('../config/users');

// Root route /users
router.get('/', (req, res) => {
  configUsers.getUserById();
  res.send('Nothing to see here');
});

// Route to profile
router.get('/profile', passport.authenticate('jwt', { session:false }), (req, res) => {
  res.json({
    name: req.user.name,
    username: req.user.username,
    email: req.user.email,
    addresses: req.user.addresses
  });
});

// Route to register users
router.post('/register', (req, res) => {
  let regUser = {
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    ebayauthtoken: '',
    ebayreftoken: '',
    addresses: [],
  }

  configUsers.addUser(regUser, (err, user) => {
    err ? res.json({success: false, msg:'Failed to register user'}) : res.json({success: true, msg:'User registered'});
  });
});

// Route to authenticate users
router.post('/authenticate', (req, res) => {
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

// Route to update users
router.post('/update', passport.authenticate('jwt', { session:false }), (req, res) => {
  const updateUser = {
    name: req.body.updateUser.name,
    username: req.body.updateUser.username,
    email: req.body.updateUser.email
  }
  const user = req.user;
  
  configUsers.updateUser(user, updateUser, (err, user) => {
    err ? res.json({success: false, msg:'Failed to update user: ' + err}) : res.json({success: true, msg:'User has been updated'});
  });
});

// Route to add or update address for user
router.post('/addUpdateAddress', passport.authenticate('jwt', { session: false }), (req, res) => {
  const address = req.body.addresses;
  const userId = req.user._id;

  configUsers.addUpdateAddress(address, userId, (err, result) => {
    err ? res.json({error: `You have an error: ${err}`}) : res.json({success: `Success: ${result}`});
  });
});

// Route to delete user address
router.post('/deleteAddress', passport.authenticate('jwt', { session: false }), (req, res) => {
  const addressId = req.body.addressId;
  const userId = req.user._id;

  configUsers.deleteAddress(addressId, userId, (err, deleted) => {
    err ? res.json({error: `You have an error: ${err}`}) : res.json({success: `Address has been deleted: ${JSON.stringify(deleted)}`});
  });
});

// Route to update password for user
router.post('/updatepw', passport.authenticate('jwt', { session:false }), (req, res) => {
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

// Route to delete a user
router.delete('/deleteUser', passport.authenticate('jwt', { session:false }), (req, res) => {
  // We pass in the entire user object
  const userId = req.user._id;

  configUsers.deleteUser(userId, (err, deleted) => {
    err ? res.json({success: false, msg:'Failed to delete user: ' + err}) : res.json({success: true, msg:'User has been deleted'});
  });
});

module.exports = router;

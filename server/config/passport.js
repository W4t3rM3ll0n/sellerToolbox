'use strict'
// Dependencies
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/users');
const configDB = require('./database');

// Instantiate container
const pPort = {};

pPort.jwtStrat = (passport) => {
  let opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = configDB.getDbConnectionString().secret;
  passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    User.findById(jwt_payload.data._id, (err, user) => {
      if(err) { 
        return done(err, false); 
      }

      if(user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  }));
}

module.exports = pPort;

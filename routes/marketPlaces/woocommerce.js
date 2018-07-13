'use strict'

const express = require('express');
const router = express.Router();

const passport = require('passport');
const configWoocommerce = require('../../config/marketPlaces/woocommerce');

// Main Page
router.get('/', (req, res) => {
    res.send('woocommerce route working');
});

// Get Keys
router.get('/getKeys', (req, res) => { // Currently we can not get the keys progmatically due to security issues with the fake HTTPS in development.
    const redirectUrl = configWoocommerce.getUrlForKeys();
    res.redirect(redirectUrl);
});

// Get Orders
router.get('/getOrders', passport.authenticate('jwt', { session:false }), (req, res) => {
    configWoocommerce.getOrders((err, result) => {
        err ? res.json({err: err}) : res.json(JSON.parse(result));
    });
});

module.exports = router;

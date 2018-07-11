'use strict'

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const passport = require('passport');
const configWoocommerce = require('../../config/marketPlaces/woocommerce');

// Main Page
router.get('/', (req, res, next) => {
    res.send('woocommerce route working');
});

router.get('/getKeys', (req, res) => { // Currently we can not get the keys progmatically due to security issues with the fake HTTPS in development.
    const redirectUrl = configWoocommerce.getUrlForKeys();
    res.redirect(redirectUrl);
});

router.get('/getOrders', (req, res) => {
    configWoocommerce.getOrders();
    // res.json({test: 'JSON response working'});
});

module.exports = router;

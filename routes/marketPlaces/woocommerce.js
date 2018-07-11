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

router.get('/getKeys', (req, res, next) => {
    const redirectUrl = configWoocommerce.getUrlForKeys();
    res.redirect(redirectUrl);
});


module.exports = router;

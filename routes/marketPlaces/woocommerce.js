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

// Get All Orders
router.get('/getAllOrders', passport.authenticate('jwt', { session:false }), (req, res) => {
    configWoocommerce.getAllOrders((err, orders) => {
        err ? res.json({err: err}) : res.json(JSON.parse(orders));
    });
});

// Get Orders By Status
router.post('/getOrdersByStatus', passport.authenticate('jwt', { session:false }), (req, res) => {
    const status = req.body.status;
    configWoocommerce.getOrdersByStatus(status, (err, orders) => {
        err ? res.json({err: err}) : res.json(JSON.parse(orders));
    });
});

// Update Orders
router.post('/updateWooOrders', passport.authenticate('jwt', { session:false }), (req, res) => {
    const orders = req.body.orders;
    const options = req.body.options;
    configWoocommerce.updateOrders(orders, options, (err, updated) => {
        err ? res.json({err: err}) : res.json(JSON.parse(updated));
    });
});

module.exports = router;

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
    // Route to update or delete single or multiple orders.
router.post('/updateWooOrders', passport.authenticate('jwt', { session:false }), (req, res) => {
    const orders = req.body.orders;
    const action = req.body.action;
    const options = req.body.options;
    const userId = req.user._id;

    // updateOrders takes 3 possible parameters
        // @orders - Array of orders, pass empty array if not using
        // @actions - Object of the action being taken which consists of an array
        // @options - The type of action to be performs. e.g. 'mark completed'
    configWoocommerce.updateOrders(orders, action, options, userId, (err, updated) => {
        err ? res.json({err: err}) : res.json(JSON.parse(updated));
    });
});

router.get('/getAllProducts', passport.authenticate('jwt', { session:false }), (req, res) => {
    configWoocommerce.getAllProducts((err, products) => {
        err ? res.json({err: err}) : res.json(JSON.parse(products));
    });
});

module.exports = router;

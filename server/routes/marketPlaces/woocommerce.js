'use strict'
// Dependencies
const express = require('express');
const router = express.Router();
const passport = require('passport');
const configWoo = require('../../config/marketPlaces/woocommerce');

// Main Page
router.get('/', (req, res) => {
  res.send('woocommerce route working');
});

// Get Keys
router.get('/getKeys', (req, res) => { // Currently we can not get the keys progmatically due to security issues with the fake HTTPS in development.
  const redirectUrl = configWoo.getUrlForKeys();
  res.redirect(redirectUrl);
});

// Update Woo Keys
router.post('/updateKeys', passport.authenticate('jwt', { session:false }), async (req, res) => {
  const id = req.user._id;
  const updateKeys = {
    'tokens.wooKey': req.body.keys.key,
    'tokens.wooSecret': req.body.keys.secret
  };

  // Init updateWooKeys()
  await configWoo.updateWooKeys(updateKeys, id)
  res.json({ success: 'Woo keys have been updated' });
});

// Get All Orders
router.get('/getAllOrders', passport.authenticate('jwt', { session:false }), async (req, res) => {
  const tokens = req.user.tokens;
  // Turn into promise init
  const orders = await configWoo.getAllOrders(tokens);
  res.json(orders);
});

// Get Orders By Status
router.post('/getOrdersByStatus', passport.authenticate('jwt', { session:false }), async (req, res) => {
  const status = req.body.status;
  const tokens = req.user.tokens;
  const orders = await configWoo.getOrdersByStatus(tokens, status);
  res.json(orders);
});

// Update Orders
  // Route to update or delete single or multiple orders.
router.post('/updateWooOrders', passport.authenticate('jwt', { session:false }), async (req, res) => {
  const orders = req.body.orders;
  const action = req.body.action;
  const options = req.body.options;
  const user = req.user;

  // updateOrders takes 3 possible parameters
    // @tokens - Woo tokens to make an API call to Woocommerce
    // @orders - Array of orders, pass empty array if not using
    // @actions - Object of the action being taken which consists of an array
    // @options - The type of action to be performs. e.g. 'mark completed'
  const updated = await configWoo.updateOrders(user.tokens, orders, action, options, user._id);
  res.json({updated});
});

router.get('/getAllProducts', passport.authenticate('jwt', { session:false }), async (req, res) => {
  const tokens = req.user.tokens;
  const products = await configWoo.getAllProducts(tokens);
  res.json(products);
});

module.exports = router;

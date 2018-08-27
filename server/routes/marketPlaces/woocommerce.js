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
  configWoo.getAllOrders(tokens)
    .then((orders) => {
      console.log('hey');
      res.json(orders);
    })
    .catch((err) => {
      res.json({err});
    });
});

// Get Orders By Status
router.post('/getOrdersByStatus', passport.authenticate('jwt', { session:false }), (req, res) => {
  const status = req.body.status;
  const tokens = req.user.tokens;
  configWoo.getOrdersByStatus(tokens, status, (err, orders) => {
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
  const tokens = req.user.tokens;

  // updateOrders takes 3 possible parameters
    // @orders - Array of orders, pass empty array if not using
    // @actions - Object of the action being taken which consists of an array
    // @options - The type of action to be performs. e.g. 'mark completed'
  configWoo.updateOrders(tokens, orders, action, options, userId, (err, updated) => {
    err ? res.json({err: err}) : res.json(JSON.parse(updated));
  });
});

router.get('/getAllProducts', passport.authenticate('jwt', { session:false }), (req, res) => {
  const tokens = req.user.tokens;
  configWoo.getAllProducts(tokens, (err, products) => {
    err ? res.json({err: err}) : res.json(JSON.parse(products));
  });
});

module.exports = router;

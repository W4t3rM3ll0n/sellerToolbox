'use strict'
// Dependencies
const express = require('express');
const router = express.Router();
const passport = require('passport');
const configOrders = require('../../config/toolbox/orders');
const configWoo = require('../../config/marketPlaces/woocommerce');

router.get('/', (req, res) => {
  res.send('hello there from orders');
});

// Get all orders specified to the user
router.get('/getAllOrders', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const id = req.user._id;

  const orders = await configOrders.getAllOrders(id);
  res.json({ orders });
});

// Sync orders from Woocommerce
router.get('/syncOrders', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const user = req.user;
  const orders = await configWoo.getAllOrders(user.tokens);

  // The catch might not be doing anything (refactor later on)
  configOrders.syncOrders(orders, user)
    .then(() => {
      res.json({ success: 'Orders have been synced' });
    })
    .catch(error => {
      res.json({ error: 'Sync orders error: '+error })
    });
});

// Update orders status
router.post('/updateOrders', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const orders = req.body.orders;
  const options = req.body.options;
  const id = req.user._id;

  // Await the orders to be updated
  await configOrders.updateOrders(orders, options, id);
  res.json({ success: 'Orders have been updated' });
});

// Delete single or multiple orders
router.post('/deleteOrders', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const orderID = req.body.orderID;
  const orders = req.body.orders;

  // Delete single order
  if(orderID) {
    await configOrders.deleteOrders(orderID);
    res.json({ success: 'Order has been deleted' });
  }

  // Delete multi orders
  if(orders) {
    await configOrders.deleteOrders(orders)
    res.json({ success: 'Orders have been deleted' });
  }
});

// Get orders by their status
router.post('/getOrdersByStatus', passport.authenticate('jwt', { session: false }), (req, res) => {
  const status = req.body.status;
  const id = req.user._id;

  // Return the orders
  configOrders.getOrdersByStatus(status, id)
    .then((orders) => {
      res.json({ orders });
    })
    .catch(error => res.json({ error: 'Get order by status error' })); // We return orders when the helper function returns something
});

// Print and update orders as `completed`
router.post('/printOrders', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const orders = req.body.orders;
  const user = req.user;

  await configOrders.createOrderLabels(orders, user);
  await configWoo.updateOrders(req.user.tokens, orders, {update: []}, 'completed');
  await configOrders.updateOrders(orders, 'completed', user._id);
  await configOrders.printOrderLabels()
    .then(() => {
      /* 
       * Trying to send PDF to client 
       * `test` is file path
       */
      // console.log(test);
      // const fs = require('fs');
      // fs.readFile(test , function (err,data){
      //   res.contentType("application/pdf");
      //   res.send(data);
      // });
      res.json({ success: 'Print order labels completed' });
    })
    .catch(error => res.json({ error: error.message }));
});

module.exports = router;

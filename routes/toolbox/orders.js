'use strict'
/* app.use('/toolbox/orders', orders); */
const express = require('express');
const router = express.Router();

const passport = require('passport');
const configOrders = require('../../config/toolbox/orders');

router.get('/', (req, res) => {
  res.send('hello there from orders');
});

// Get all orders specified to the user
router.get('/getAllOrders', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const id = req.user._id;

  await configOrders.getAllOrders(id).then(orders => {
    res.json({ orders });
  }).catch(error => res.json({ error }));

});

router.post('/saveOrders', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const orders = req.body.orders;
  const id = req.user._id;
  
  await configOrders.saveOrders(orders, id).then(() => {
    res.json({ success: 'Orders have been saved' });
  }).catch(error => res.json({ error: 'Save orders error' }));

});

router.post('/updateOrders', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const orders = req.body.orders;
  const options = req.body.options;
  const id = req.user._id;

  await configOrders.updateOrders(orders, options, id).then(success => {
    res.json({ success: 'Orders have been updated' });
  }).catch(error => res.json({ error: 'Update orders error' }));

});

// Delete single or multiple orders
router.post('/deleteOrders', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const orderID = req.body.orderID;
  const orders = req.body.orders;

  // Delete single order
  if(orderID) {
    await configOrders.deleteOrders(orderID).then(() => {
      res.json({ success: 'Order has been deleted' });
    }).catch(() => res.json({ error: 'Delete single order error'}));
  }

  // Delete multi orders
  if(orders) {
    await configOrders.deleteOrders(orders).then(() => {
      res.json({ success: 'Orders have been deleted' });
    }).catch(() => res.json({ error: 'Delete multi order error' }));
  }

});

router.post('/getOrdersByStatus', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const status = req.body.status;
  const id = req.user._id;

  await configOrders.getOrdersByStatus(status, id).then((orders) => {
    res.json({ orders });
  }).catch(error => res.json({ error: 'Get order by status error' }));

});

router.post('/printOrders', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const orders = req.body.orders;
  // const auth = req.user.tokens.pitneyBowesAuthToken;
  const user = req.user;

  await configOrders.createOrderLabels(orders, user).then((success) => {
    res.json({ success });
  }).catch(error => res.json({ error: error.message }));
  
});

module.exports = router;

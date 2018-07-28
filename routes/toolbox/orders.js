'use strict'
const express = require('express');
const router = express.Router();

const passport = require('passport');
const configOrders = require('../../config/toolbox/orders');

router.get('/', (req, res) => {
    res.send('hello there from orders');
});

router.post('/saveOrders', passport.authenticate('jwt', { session:false }), (req, res) => {
    const orders = req.body.orders;
    const userId = req.user._id;
    
    configOrders.saveOrders(orders, userId, (err, saved) => {
        err ? res.json({error: err}) : res.json({saved: saved});
    });
});

router.post('/updateOrders', passport.authenticate('jwt', { session:false }), async (req, res) => {
    const orders = req.body.orders;
    const options = req.body.options;
    const userId = req.user._id;

    await configOrders.updateOrders(orders, options, userId).then(success => {
        res.json({ success: 'Orders have been updated' });
    }).catch(error => { res.json({ error: 'You have an error updating the orders' })});

});

// Route deleteSingleOrder && deleteMultiOrder - Merge into one route.
router.post('/deleteSingleOrder', passport.authenticate('jwt', { session:false }), (req, res) => {
    const orderID = req.body.orderID;

    configOrders.deleteSingleOrder(orderID, (err, deleted) => {
        err ? res.json({error: err}) : res.json({deleted: deleted});
    });
});
// Route deleteSingleOrder && deleteMultiOrder - Merge into one route.
router.post('/deleteOrders', passport.authenticate('jwt', { session:false }), (req, res) => {
    const orders = req.body.orders;
    
    configOrders.deleteOrders(orders, (err, deleted) => {
        err ? res.json({error: err}) : res.json({deleted: deleted});
    });
});

router.get('/getAllOrders', passport.authenticate('jwt', { session:false }), (req, res) => {
    const userId = req.user._id;

    configOrders.getAllOrders(userId, (err, orders) => {
        err ? res.json({err: err}) : res.json({orders: orders});
    });
});

router.post('/getOrdersByStatus', passport.authenticate('jwt', { session:false }), (req, res) => {
    const status = req.body.status;
    const userId = req.user._id;

    configOrders.getOrdersByStatus(status, userId, (err, orders) => {
        err ? res.json({err: err}) : res.json({orders: orders});
    });
});

module.exports = router;

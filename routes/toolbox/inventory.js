'use strict'

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const passport = require('passport');

const configInventory = require('../../config/toolbox/inventory');

// Main Page
router.get('/', (req, res) => {
    res.send('hello there from inventory');
});

// Default updates for inventory - updates sections such as pending orders and available quantity.
router.get('/defaultUpdates', passport.authenticate('jwt', { session:false }), (req, res) => {
    const userId = req.user._id;

    configInventory.defaultUpdates(userId, (err, updates) => {
        err ? res.json({error: err}) : res.json({updates: updates});
    });
});

// Create Products
router.put('/createProducts', passport.authenticate('jwt', { session:false }), (req, res) => {

    const products = req.body.products;
    if(products.length > 1) {
        products.forEach((product) => {
            product['userId'] = req.user._id
        });
    } else {
        products[0]['userId'] = req.user._id
    }
    // console.log(products);
    
    configInventory.addProducts(products, (err, response) => {
        err ? res.json({error: err}) : res.json(response);
    });

});

// Update Products
router.post('/updateProducts', passport.authenticate('jwt', { session:false }), (req, res) => {
    
    const products = req.body.products;
    // console.log(products);
    
    // userId is just used for double verification.
    const userId = req.user._id;
    // console.log(products);

    configInventory.updateProducts(products, userId, (err, response) => {
        err ? res.json({error: err}) : res.json(response);
    });

});

// Get Products
router.get('/getProducts', passport.authenticate('jwt', {session: false}), (req, res) => {
    // Search products collection with the user id.
    const userId = req.user._id;

    configInventory.getProducts(userId, (err, products) => {
        err ? res.json({error: err}) : res.json(products);
    });

});

// Delete Products
router.post('/deleteProducts', passport.authenticate('jwt', {session: false}), (req, res) => {

    const products = req.body.items;
    // userId is just used for double verification.
    const userId = req.user._id;

    configInventory.deleteProducts(products, userId, (err, deleted) => {
        err ? res.json({error: err}) : res.json(deleted);
    });

});

// Link Items
router.post('/linkItems', passport.authenticate('jwt', {session: false}), (req, res) => {
    const toolboxItem = req.body.toolboxItem[0];
    const marketplaceItem = req.body.marketplaceItem[0];
    // userId is just used for double verification.
    const userId = req.user._id;

    configInventory.linkItems(toolboxItem, marketplaceItem, userId, (err, linked) => {
        err ? res.json({error: err}) : res.json(linked);
    });
});

module.exports = router;

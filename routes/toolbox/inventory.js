'use strict'

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const passport = require('passport');

const configInventory = require('../../config/toolbox/inventory');

// Main Page
router.get('/', (req, res, next) => {
    res.send('hello there from inventory');
});

// Create Products
router.put('/createProducts', passport.authenticate('jwt', { session:false }), (req, res, next) => {

    const products = req.body.products;
    // console.log(products);
    
    configInventory.addProducts(products, (err, response) => {
        err ? res.json(err) : res.json(response);
    });

});

// Update Products
router.post('/updateProducts', passport.authenticate('jwt', { session:false }), (req, res, next) => {
    
    const products = req.body.products;
    // console.log(products);

    configInventory.updateProducts(products, (err, response) => {
        err ? res.json(err) : res.json(response);
    });

});

// Get Products
router.get('/getProducts', passport.authenticate('jwt', {session: false}), (req, res, next) => {

    configInventory.getProducts((err, products) => {
        err ? res.json(err) : res.json(products);
    });

});

// Delete Products
router.post('/deleteProducts', passport.authenticate('jwt', {session: false}), (req, res, next) => {

    const products = req.body.items;
    configInventory.deleteProducts(products, (err, deleted) => {
        err ? res.json(err) : res.json(deleted);
    });

});

module.exports = router;

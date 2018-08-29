'use strict'
// Dependencies
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const inventory = require('../../config/toolbox/inventory');

// Main Page
router.get('/', (req, res) => {
  res.send('hello there from inventory');
});

// Default updates for inventory - updates sections such as pending orders and available quantity.
router.get('/syncInventory', passport.authenticate('jwt', { session:false }), async (req, res) => {
  const id = req.user._id;

  await inventory.syncInventory(id);
  res.json({ success: 'Inventory has been synced' })
});

// Create Products
router.put('/createProducts', passport.authenticate('jwt', { session:false }), async (req, res) => {
  const products = req.body.products;
  if(products.length > 1) {
    products.forEach((product) => {
      product['userId'] = req.user._id
    });
  } else {
    products[0]['userId'] = req.user._id
  };
  
  const product = await inventory.addProducts(products);
  res.json(product);
});

// Update Products
router.post('/updateProducts', passport.authenticate('jwt', { session:false }), async (req, res) => {
  const products = req.body.products;
  // userId is just used for double verification.
  const userId = req.user._id;

  const update = await inventory.updateProducts(products, userId);
  res.json(update);
});

// Get Products
router.get('/getProducts', passport.authenticate('jwt', {session: false}), async (req, res) => {
  // Search products collection with the user id.
  const userId = req.user._id;

  const products = await inventory.getProducts(userId);
  res.json(products);
});

// Delete Products
router.post('/deleteProducts', passport.authenticate('jwt', {session: false}), async (req, res) => {
  const products = req.body.items;
  // userId is just used for double verification.
  const userId = req.user._id;

  const deleted = await inventory.deleteProducts(products, userId);
  res.json(deleted);
});

// Link Items
router.post('/linkItems', passport.authenticate('jwt', {session: false}), async (req, res) => {
  const toolboxItem = req.body.toolboxItem[0];
  const marketplaceItem = req.body.marketplaceItem[0];
  // userId is just used for double verification.
  const userId = req.user._id;

  const linked = await inventory.linkItems(toolboxItem, marketplaceItem, userId);
  res.json(linked);
});

module.exports = router;

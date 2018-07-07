'use strict'

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Products Schema
const Schema = mongoose.Schema;
const productsSchema = new Schema({
    sku: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    quantity: {
        quantity: Number, // Total quantity available.
        availableQuantity: Number, // Total quantity available.
        alertQuantity: Number, // The minimum quantity needed to be alerted for reorder,
        pendingOrders: Number, // The quantity that are available but subtracted since ther is a pending order.
        neededQuantity: Number // The needed quantity to meet the requirement to not trigger the alert quantity.
    },
    description: String,
    upc: String,
    barcode: String,
    images: String,
    condition: String,
    price: {
        purchasePrice: Number,
        stockValue: Number
    },
    category: String,
    variationGroup: String,
    location: String,
    detail: {
        weight: Number,
        height: Number,
        width: Number,
        depth: Number
    },
    binLocation: String,
    monitor: Boolean,
    linked: {
        ebay: Boolean,
        amazon: Boolean,
        shopify: Boolean
    },
    createdDate: Date,
    modifiedDate: Date,
    userId: String
    
});

const products = mongoose.model('Products', productsSchema);

module.exports = products;

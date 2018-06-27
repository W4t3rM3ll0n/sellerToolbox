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
    location: {
        address: {
            address1: String,
            address2: String,
            city: String,
            state: String,
            zip: String
        }
    },
    binLocation: String,
    linked: {
        ebay: Boolean,
        amazon: Boolean,
        shopify: Boolean
    }
    
});

const products = mongoose.model('Products', productsSchema);

module.exports = products;

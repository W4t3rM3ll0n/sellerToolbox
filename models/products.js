'use strict'
const mongoose = require('mongoose');

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
        quantity: Number, // Total quantity available on hand.
        availableQuantity: Number, // Total quantity available after subtracting items in pending orders.
        alertQuantity: Number, // The minimum quantity needed to be alerted for reorder.
        pendingOrders: Number,
        neededQuantity: Number // The needed quantity to meet the requirement to not trigger the alert quantity.
    },
    orders: [], // Orders that are pending from the item that is linked.
    description: String,
    upc: String,
    barcode: String,
    images: String,
    condition: String,
    price: {
        sellPrice: Number,
        purchasePrice: Number,
        stockValue: Number
    },
    category: String,
    variationGroup: String,
    location: {
        fullAddress: String,
        company: String,
        name: String,
        address1: String,
        address2: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        email: String,
        phone: String
    },
    detail: {
        weight: Number,
        height: Number,
        width: Number,
        depth: Number
    },
    binLocation: String,
    monitor: Boolean,
    linked: {
        ebay: [],
        amazon: [],
        woocommerce: [],
        shopify: []
    },
    createdDate: Date,
    modifiedDate: Date,
    userId: String
    
});

const products = mongoose.model('Products', productsSchema);

module.exports = products;

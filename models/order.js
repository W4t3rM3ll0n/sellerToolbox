'use strict'
const mongoose = require('mongoose');

const address = {
    firstName: String,
    lastName: String,
    company: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    email: String,
    phone: String
}

// Products Schema
const Schema = mongoose.Schema;
const ordersSchema = new Schema({
    currency: String,
    billing: address,
    shipping: address,
    orderItems: [],
    total: Number,
    totalTax: Number,
    shippingTotal: Number,
    refunds: [],
    paymentMethod: String,
    marketplaceID: String,
    paidDate: Date,
    createdDate: Date,
    modifiedDate: Date,
    completedDate: Date,
    status: String,
    userId: String
});

const orders = mongoose.model('Orders', ordersSchema);

module.exports = orders;

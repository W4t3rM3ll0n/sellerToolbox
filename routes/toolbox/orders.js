'use strict'
const express = require('express');
const router = express.Router();

const passport = require('passport');
const configOrders = require('../../config/toolbox/orders');

router.get('/', (req, res) => {
    res.send('hello there from orders');
});

module.exports = router;

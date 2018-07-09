'use strict'

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const passport = require('passport');

const configOrders = require('../../config/toolbox/orders');

router.get('/', (req, res, next) => {
    res.send('hello there from orders');
});

module.exports = router;

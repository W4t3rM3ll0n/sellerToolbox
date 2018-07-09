'use strict'

const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const passport = require('passport');
const configEbay = require('../config/ebay');

// Main Page
router.get('/', (req, res, next) => {
    res.send('/ebay');
});

// Ebay Tokens To Client
router.get('/tokens', passport.authenticate('jwt', { session:false }), (req, res, next) => {
    res.json({
        authToken: req.user.ebayauthtoken,
        refToken: req.user.ebayreftoken
    });
});

// Accept HTML
router.post('/accept', passport.authenticate('jwt', { session:false }), (req, res, next) => {

    const user = req.user;
    const code = req.body.code;
    // console.log(code);

    // Calling acceptToken method from ebay config. code is grabbed from the url parameters.
    configEbay.acceptToken(code, user, res, (err, result) => {
        err ? res.json({err: err}) : res.json({success: 'Ebay Auth and Ref tokens have been updated', details: result});

    });
    
});

// Refresh Token - the route to call for a new auth token
router.post('/refreshToken', passport.authenticate('jwt', { session:false }), (req, res, next) => {

    // The eBay refresh Token from user account
    const refToken = req.user.ebayreftoken;
    const user = req.user;

    // Calling acceptToken method from ebay config
    configEbay.refreshToken(refToken, user, res, (err, result) => {
        err ? res.json({err: err}) : res.json({success: 'User has been updated', details: result});

    });
    
});

// Route to Opt into Selling Policy Management -- Currently Not Working
router.post('/spm', passport.authenticate('jwt', { session:false }), (req, res, next) => {

    // Ebay Auth Token
    const eToken = req.user.ebayauthtoken;

    configEbay.optInSPM(eToken, res, (err, result) => {
        err ? res.json(err) : res.json({ success: 'You are opted in', response: result });

    });

});

// Getting Opted in Prorams
router.get('/getOptedInPrograms', passport.authenticate('jwt', { session:false }), (req, res, next) => {

    const eToken = req.user.ebayauthtoken;

    configEbay.getOptInPrograms(eToken, res, (err, result) => {
        err ? res.json(err) : res.json(result);

    });

});

// Get Ebay Policies
router.get('/getEbayPolicies', passport.authenticate('jwt', { session:false }), (req, res, next) => {

    const eToken = req.user.ebayauthtoken;

    configEbay.getPolicies(eToken, res, (err, policies) => {
        err ? res.json(err) : res.json(policies);

    });

});

// Test call to ebay for getting public item information - // Currently not working ECONNERSET ERROR
router.get('/testCall', passport.authenticate('jwt', { session:false }), (req, res, next) => {
    
    const eToken = req.user.ebayauthtoken;

    configEbay.testCall(eToken, res, (err, result) => {
        err ? res.json(err) : res.json(result);

    });
    
});

// Currently we have to get offers one by one with ebays getInvenotryItem API. We pass in an array of active SKUs.
router.get('/getOffers', passport.authenticate('jwt', { session:false }), (req, res, next) => {

    const eToken = req.user.ebayauthtoken;

    configEbay.getOffers(eToken, res, (err, offers) => {
        err ? res.json(err) : res.json(offers);
    });
});

// Create Or Replace Inventory Item.
router.put('/createOrReplaceInventory', passport.authenticate('jwt', { session:false }), (req, res, next) => {
    
    const eToken = req.user.ebayauthtoken;
    const products = JSON.stringify(req.body.products);
    const sku = req.body.sku;

    console.log(products);
    console.log(sku);

    configEbay.createOrReplaceInventory(eToken, products, sku, res, (err, inventory) => {
        err? res.json(err) : res.json(inventory);
    });

});

module.exports = router;

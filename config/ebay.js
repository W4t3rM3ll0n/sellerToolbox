'use strict'

const querystring = require('querystring');

const configHttp = require('../config/httpReq');
const Users = require('../models/users');

require('dotenv').config();

// Function for when passing in options to the http request
const ebayHttpOptions = (path, method, headers) => {
    return {
        host: 'api.sandbox.ebay.com',
        port: 443,
        path: path,
        method: method,
        headers: headers
    };
};
// const ebayHttpOptions = (path, method, headers) => {
//     return {
//         host: 'cors-anywhere.herokuapp.com',
//         port: 443,
//         path: path,
//         method: method,
//         headers: headers
//     };
// };

module.exports = {

    acceptToken: (code, user, res, callback) => {

        const opt = ebayHttpOptions(
            '/identity/v1/oauth2/token',
            'POST', {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + process.env.EBAY_AUTH
            }
        );

        // Request Body Post Data
        const postData = querystring.stringify({
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": process.env.EBAY_REDIRECT_URI
        });

        // Making the http call to get referesh and access token
        configHttp.postJSON(opt, postData, res, function(statusCode, result) {
            if(statusCode !== 200) {
                callback(result, null);
            } else {
                // This is to save the eBay tokens
                let saveTokens = {
                    ebayauthtoken: result.access_token,
                    ebayreftoken: result.refresh_token
                }
                // console.log("onResult: (" + statusCode + ")" + JSON.stringify(result));

                // Update tokens for specific user
                Users.findByIdAndUpdate(user.id, saveTokens).exec()
                    .then((updated) => {
                        // console.log(`${updated}, User Updated!`);
                        callback(null, updated);

                    }).catch((err) => {
                        console.error(err);

                    });
            }
        });
    },

    // Call to ebay for refreshing a token. We pass an ebay refresh token that is sent from the client by grabbing the info from the database.
    refreshToken: (refToken, user, res, callback) => {

        const opt = ebayHttpOptions(
            '/identity/v1/oauth2/token',
            'POST', {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + process.env.EBAY_AUTH
            }
        );

        // Request Body Post Data
        const postData = querystring.stringify({
            "grant_type": "refresh_token",
            "refresh_token": refToken,
            "scope": "https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/buy.order.readonly https://api.ebay.com/oauth/api_scope/buy.guest.order https://api.ebay.com/oauth/api_scope/sell.marketing.readonly https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.inventory.readonly https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account.readonly https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly https://api.ebay.com/oauth/api_scope/sell.fulfillment https://api.ebay.com/oauth/api_scope/sell.analytics.readonly https://api.ebay.com/oauth/api_scope/sell.marketplace.insights.readonly https://api.ebay.com/oauth/api_scope/commerce.catalog.readonly"
        });

        // Making the http call to get referesh and access token
        configHttp.postJSON(opt, postData, res, function(statusCode, result) {
            if(statusCode !== 200) {
                callback(result, null);
            } else {
                // This is to save the eBay tokens
                let saveToken = {
                    ebayauthtoken: result.access_token,
                }

                // console.log("onResult: (" + statusCode + ")" + JSON.stringify(result));
                // Update tokens for specific user
                Users.findByIdAndUpdate(user.id, saveToken).exec()
                    .then((updated) => {
                        // console.log(`${updated}, User Updated!`);
                        callback(null, updated);

                    }).catch((err) => {
                        console.error(err);

                    });
            }
        });
    },

    optInSPM: (eToken, res, callback) => {

        const opt = ebayHttpOptions(
            '/sell/account/v1/program/opt_in',
            'POST', {
                'Authorization': 'Bearer ' + eToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        );

        // Request Body Post Data
        const postData = querystring.stringify(JSON.stringify({
            "programType": "SELLING_POLICY_MANAGEMENT"
        }));

        configHttp.postJSON(opt, postData, res, (statusCode, result) => {
            statusCode !== 200 ? callback(result, null) : callback(null, result);

        });
        
    },

    getOptInPrograms: (eToken, res, callback) => {

        const opt = ebayHttpOptions(
            '/sell/account/v1/program/get_opted_in_programs',
            'GET', {
                'Authorization': 'Bearer ' + eToken,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        );

        configHttp.getJSON(opt, res, (statusCode, result) => {
            statusCode !== 200 ? callback(result, null) : callback(null, result);

        });
        
    },

    // Getting all polices needed to list items for eBay
    getPolicies: (eToken, res, callback) => {
        
        const policies = ['fulfillment_policy', 'payment_policy', 'return_policy'];
        let listOfPolicies = [];

        // A single promise that takes in a policy argument then makes the proper http calls.
        const returnPolicies = (policy) => {
            return new Promise((resolve, reject) => {
                const opt = ebayHttpOptions(
                    `/sell/account/v1/${policy}?marketplace_id=EBAY_US`, 
                    'GET', {
                        'Authorization': 'Bearer ' + eToken,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                );
                
                configHttp.getJSON(opt, res, (statusCode, result) => {
                    statusCode !== 200 ? reject(result) : resolve(result);

                });
            })
        }

        // We call the promise 3 times then push each policy to the listOfPolicies array.
        returnPolicies(policies[0])
            .then((data) => {
                listOfPolicies.push(data);
                return returnPolicies(policies[1])
            })
            .then((data) => {
                listOfPolicies.push(data);
                return returnPolicies(policies[2])
            })
            .then((data) => {
                listOfPolicies.push(data);
                callback(null, listOfPolicies);
            })
        .catch((err) => {
            callback(err, null);
        });

    },

    // Currently not working ECONNERSET ERROR
    testCall: (eToken, res, callback) => {

        const opt = ebayHttpOptions(
            '/buy/browse/v1/item/v1|110310741127|0',
            'GET', {
                'Authorization': 'Bearer ' + eToken,
                'Content-Type': 'application/json'
            }
        );
        
        configHttp.getJSON(opt, res, (statusCode, result) => {
            statusCode !== 200 ? callback(result, null) : callback(null, result);

        });

    },

    getOffers: (eToken, res, callback) => {

        const opt = ebayHttpOptions(
            '/sell/inventory/v1/inventory_item/Testing1',
            'GET', {
                'Authorization': 'Bearer ' + eToken,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        );

        configHttp.getJSON(opt, res, (statusCode, offers) => {
            statusCode !== 200 ? callback(offers, null) : callback(null, offers);
            
        });
    },

    createOrReplaceInventory: (eToken, products, sku, res, callback) => {
        const opt = ebayHttpOptions(
            `/sell/inventory/v1/inventory_item/${sku}`,
            'PUT', {
                'Authorization': 'Bearer ' + eToken,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Content-Language': 'en-US'
            }
        );

        // Request Body Post Data
        const postData = querystring.stringify(products);

        // console.log(postData);

        configHttp.postJSON(opt, postData, res, (statusCode, products) => {
            statusCode !== 200 ? callback(products, null) : callback(null, products);

        });
        
    },

}

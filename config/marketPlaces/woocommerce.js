'use strict'

const querystring = require('querystring');
const wooApi = require('woocommerce-api');

const configHttp = require('../httpReq');

require('dotenv').config();

// Http Auth
const Woocommerce = new wooApi({
    url: 'https://publifiedlabs.com/apiTest',
    consumerKey: process.env.WOO_KEY,
    consumerSecret: process.env.WOO_SECRET,
    wpAPI: true,
    version: 'wc/v2'
});

module.exports = {

    getUrlForKeys: () => {
        const store_url = 'https://publifiedlabs.com/apiTest';
        const endpoint = '/wc-auth/v1/authorize';
        const params = {
          app_name: 'Seller Toolbox',
          scope: 'read_write',
          user_id: 123,
          return_url: 'https://localhost:3000/user/woocommerce',
          callback_url: 'https://localhost:3000/user/woocommerce'
        };
        const query_string = querystring.stringify(params).replace(/%20/g, '+');
        
        // console.log(store_url + endpoint + '?' + query_string);
        const redirectUrl = store_url + endpoint + '?' + query_string;
        return redirectUrl;
    },

    getOrders() {
        Woocommerce.get('', (err, data, res) => {
            console.log(res);
        });
    },

}

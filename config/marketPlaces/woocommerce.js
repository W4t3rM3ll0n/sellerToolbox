'use strict'

const querystring = require('querystring');
const WooAPI = require('woocommerce-api');

require('dotenv').config();

// OAuth Function when calling to Woocomerce API
function oAuth(url, version) {
    return new WooAPI({
        url: url,
        consumerKey: process.env.WOO_KEY,
        consumerSecret: process.env.WOO_SECRET,
        wpAPI: true,
        version: version,
        // queryStringAuth: true // Force Basic Authentication as query string true and using under HTTPS
    });
}

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

    // Initiate the oAuth function then call the HTTP request to Woocommerce's end points.
    getOrders(callback) {
        const Woocommerce = oAuth('https://publifiedlabs.com/apiTest', 'wc/v2');
        Woocommerce.get('orders', (err, data, res) => {
            err ? callback(err, null) : callback(null, res);
        });
    },

}

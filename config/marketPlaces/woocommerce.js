'use strict'
const querystring = require('querystring');
const WooAPI = require('woocommerce-api');
// const Products = require('../../models/products');

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

    // Get All Orders
    getAllOrders(callback) {
        const Woocommerce = oAuth('https://publifiedlabs.com/apiTest', 'wc/v2');
        Woocommerce.get('orders', (err, data, res) => {
            err ? callback(err, null) : callback(null, res);
        });
    },

    // Initiate the oAuth function then call the HTTP request to Woocommerce's end points.
    getOrdersByStatus(status, callback) {
        const Woocommerce = oAuth('https://publifiedlabs.com/apiTest', 'wc/v2');
        Woocommerce.get('orders?status='+status, (err, data, res) => {
            err ? callback(err, null) : callback(null, res);
        });
    },

    updateOrders(orders, action, options, userId, callback) {
        const Woocommerce = oAuth('https://publifiedlabs.com/apiTest', 'wc/v2');
        const data = action;
        const keyNames = Object.keys(data);
        orders.forEach((order) => {
            // Section to update order on marketplace
            if(keyNames[0] === 'update') {
                data.update.push({
                    id: order.marketplaceID,
                    status: options
                });
            } else if(keyNames[0] === 'delete') {
                data.delete.push(order.marketplaceID);
            }
        });
        // console.log(data);

        Woocommerce.put('orders/batch', data, (err, data, res) => {
            err ? callback(err, null) : callback(null, res);
        });
    },

    getAllProducts(callback) {
        const Woocommerce = oAuth('https://publifiedlabs.com/apiTest', 'wc/v2');
        Woocommerce.get('products', (err, data, res) => {
            err ? callback(err, null) : callback(null, res);
        });
    },

}

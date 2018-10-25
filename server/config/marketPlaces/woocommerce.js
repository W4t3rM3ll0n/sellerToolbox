'use strict'
// Dependencies
const querystring = require('querystring');
const WooAPI = require('woocommerce-api');
require('dotenv').config();
const Users = require('../../models/users');

// Instantiate Container
const woocommerce = {};

// OAuth Function when calling to Woocomerce API
function oAuth(url, version, key, secret) {
  return new WooAPI({
    url: url,
    consumerKey: key,
    consumerSecret: secret,
    wpAPI: true,
    version: version,
    // queryStringAuth: true // Force Basic Authentication as query string true and using under HTTPS
  });
}

// Get URL for keys
woocommerce.getUrlForKeys = () => {
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
}

// Update Woo keys
woocommerce.updateWooKeys = async (keys, id) => {
  await Users.findByIdAndUpdate(id, keys).exec();
};

// Get All Orders
woocommerce.getAllOrders = (tokens) => {
  return new Promise((resolve) => {
    const Woocommerce = oAuth('https://publifiedlabs.com/apiTest', 'wc/v2', tokens.wooKey, tokens.wooSecret);
    Woocommerce.get('orders', (err, data, res) => {
      if(err) {
        resolve({ ok: false, 'Error': err });
      } else {
        resolve(JSON.parse(res));
      };
    });
  });
};

// Initiate the oAuth function then call the HTTP request to Woocommerce's end points.
woocommerce.getOrdersByStatus = (tokens, status) => {
  return new Promise((resolve) => {
    const Woocommerce = oAuth('https://publifiedlabs.com/apiTest', 'wc/v2', tokens.wooKey, tokens.wooSecret);
    Woocommerce.get('orders?status='+status, (err, data, res) => {
      if(err) {
        resolve({ ok: false, 'Error': err });
      } else {
        resolve(JSON.parse(res));
      };
    });
  });
};

// Update Woo orders in the marketplace
woocommerce.updateOrders = (tokens, orders, action, options, userId) => {
  return new Promise((resolve) => {
    const Woocommerce = oAuth('https://publifiedlabs.com/apiTest', 'wc/v2', tokens.wooKey, tokens.wooSecret);
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
  
    // Send call to the Woo API
    Woocommerce.put('orders/batch', data, (err, data, res) => {
      if(err) {
        resolve(err);
      } else {
        resolve(JSON.parse(res));
      }
    });
  });
}

woocommerce.getAllProducts = (tokens) => {
  return new Promise((resolve) => {
    const Woocommerce = oAuth('https://publifiedlabs.com/apiTest', 'wc/v2', tokens.wooKey, tokens.wooSecret);
    Woocommerce.get('products/?per_page=75', (err, data, res) => {
      if(err) {
        resolve({ ok: false, 'Error': err });
      } else {
        resolve(JSON.parse(res));
      }
    });
  });
}

module.exports = woocommerce;

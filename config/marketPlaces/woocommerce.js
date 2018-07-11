'use strict'

const querystring = require('querystring');

module.exports = {

    getUrlForKeys: () => {
        const store_url = 'https://publifiedlabs.com';
        const endpoint = '/wc-auth/v1/authorize';
        const params = {
          app_name: 'Seller Toolbox',
          scope: 'read_write',
          user_id: 123,
          return_url: 'http://localhost:3000',
          callback_url: 'http://localhost:3000'
        };
        const query_string = querystring.stringify(params).replace(/%20/g, '+');
        
        // console.log(store_url + endpoint + '?' + query_string);
        const redirectUrl = store_url + endpoint + '?' + query_string;
        return redirectUrl;
    },

}

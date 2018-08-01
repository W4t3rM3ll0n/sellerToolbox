'use strict'

const http = require('http');
const https = require('https');

module.exports = {

  // HTTP Request
  getJSON: (options, res, onResult) => {
    var port = options.port === 443 ? https : http;
    var req = port.request(options, (res) => {
      var output = '';
      // console.log('Response from server started');
      // console.log(`Server Status: ${res.statusCode}`);
      // console.log('Response Headers: %j', res.headers);

      res.setEncoding('utf8');
      res.once('data', (chunk) => {
        // console.log('json request chunk is good');
      });

      res.on('data', (chunk) => {
        output += chunk;
      });
  
      res.on('end', () => {
        var obj = JSON.parse(output);
        onResult(res.statusCode, obj);
        // console.log(output);
      });
    });
    
    req.on('error', (err) => {
      res.json({error: err});
    });
    
    req.end();
  },

  // HTTP Request
  postJSON: (options, postData, res, onResult) => {
    var port = options.port === 443 ? https : http;
    var req = port.request(options, (res) => {
      var output = '';
      // console.log('Response from server started');
      // console.log(`Server Status: ${res.statusCode}`);
      // console.log('Response Headers: %j', res.headers);

      res.setEncoding('utf8');
      res.once('data', (chunk) => {
        // console.log('json request chunk is good');
      });

      res.on('data', (chunk) => {
        output += chunk;
      });
  
      res.on('end', () => {
        var obj = JSON.parse(output);
        onResult(res.statusCode, obj);
        // console.log(output);
      });
    });
    
    req.on('error', (err) => {
      res.json({error: err});
    });
    
    // Include request body
    req.write(postData);
    req.end();
  },

}

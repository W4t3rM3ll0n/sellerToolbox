'use strict'
// Dependencies
const http = require('http');
const https = require('https');
const querystring = require('querystring');

// Instantiate Container
const lib = {};

// Http options helper
lib.httpOptions = (host, port, path, method, headers) => {
  return {
    host: host, // api-sandbox.pitneybowes.com
    port: port,
    path: path,
    method: method,
    headers: headers
  };
}

// Querystring postData
lib.postData = (data) => {
  return querystring.stringify(data)
}

// Retreive helper function
lib.retrieve = (options, postData) => {
  return new Promise((resolve, reject) => {
    const port = options.port === 443 ? https : http;
    const req = port.request(options, (res) => {
      res.setEncoding('utf8');
      let output = '';

      res.on('data', (chunk) => {
        output += chunk;
      });

      res.on('end', () => {
        resolve(JSON.parse(output));
      });
    });

    req.on('error', (err) => {
      reject(err);
    });
    
    if(postData !== '') {
      req.write(postData);
    }
    req.end();
  });
}

// HTTP Request
lib.getJSON = (options, res, onResult) => {
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
}

// HTTP Request
lib.postJSON = (options, postData, res, onResult) => {
  const port = options.port === 443 ? https : http;
  const req = port.request(options, (res) => {
    let output = '';
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
      const obj = JSON.parse(output);
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
}

module.exports = lib;

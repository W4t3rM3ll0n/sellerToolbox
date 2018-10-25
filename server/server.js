'use strict'
// Dependencies
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const https = require('https');
const fs = require('fs');
const configDB = require('./config/database');
const configPassport = require('./config/passport');
const app = express();

// Connect to MongoDB
mongoose.connect(configDB.getDbConnectionString().database, err => err ? console.error(err) : console.log('Connected To MongoDB'));

// Instantiate Container
const server = {};

// All server logic for bot the http and https server
server.unifiedServer = (app) => {
  // Cors MW
  app.use(cors());
  
  // Set Static Folder for Angular
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Different MW
  app.use(bodyParser.json());
  
  // Passport Middleware
  app.use(passport.initialize());
  app.use(passport.session());
  
  configPassport.jwtStrat(passport);
  
  // Setting and Handling Routes
  const users = require('./routes/users');
  const inventory = require('./routes/toolbox/inventory');
  const orders = require('./routes/toolbox/orders');
  const ebay = require('./routes/marketplaces/ebay');
  const woocommerce = require('./routes/marketPlaces/woocommerce');
  const shippingAPIs = require('./routes/shipping/shippingAPIs');
  
  app.use('/users', users);
  app.use('/toolbox/inventory', inventory);
  app.use('/toolbox/orders', orders);
  app.use('/ebay', ebay);
  app.use('/woocommerce', woocommerce);
  app.use('/shipping', shippingAPIs);
  
  app.get('/', (req, res) => {
    res.send('Invalid Endpoint');
  });
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
  });
};

// Instantiate HTTP server
server.httpServer = (app) => {
  server.unifiedServer(app);
  // Listen on Port
  const port = process.env.PORT || 3000;
  app.listen(port, err => err ? console.error(err) : console.log(`Server started on port: ${port}`));
};

// Instantiate HTTPS server
server.httpsServer = (app) => {
  server.unifiedServer(app);
  const port = 5000;
  const options = {
      key: fs.readFileSync('./devSecurity/server.key'),
      cert: fs.readFileSync('./devSecurity/server.crt'),
      requestCert: false,
      rejectUnauthorized: false
  };
  
  https.createServer(options, app).listen(port, function() {
      console.log(`https Server started on port: ${port}`)
  });
};

// Instantiate init script
server.init = () => {
  server.httpServer(app);
  server.httpsServer(app);
};

// Init script
server.init();

module.exports = server;

'use strict'

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const configDB = require('./config/database');
const cors = require('cors');

const passport = require('passport');
const configPassport = require('./config/passport');

const app = express();

// Connect to MongoDB
mongoose.connect(configDB.getDbConnectionString().database, err => 
    err ? console.error(err) : console.log('Connected To MongoDB'));
    
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
const ebay = require('./routes/ebay');

app.use('/users', users);
app.use('/toolbox/inventory', inventory);
app.use('/toolbox/orders', orders);
app.use('/ebay', ebay);

app.get('/', (req, res) => {
    res.send('Invalid Endpoint');
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Listen on Port
const port = process.env.PORT || 3000;
app.listen(port, (err) => 
    err ? console.error(err) : console.log(`Server started on port: ${port}`));


// /*** HTTPS Development Env ***/
// const https = require('https');
// const fs = require('fs');

// var options = {
//     key: fs.readFileSync('./devSecurity/server.key'),
//     cert: fs.readFileSync('./devSecurity/server.crt'),
//     requestCert: false,
//     rejectUnauthorized: false
// };

// https.createServer(options, app).listen(port, function() {
//     console.log(`https Server started on port: ${port}`)
// });

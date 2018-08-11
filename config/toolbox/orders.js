'use strict'
// Dependencies
const PDFKit = require('pdfkit');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Orders = require('../../models/order');
const Products = require('../../models/products');
const httpReq = require('../../config/httpReq');

// Container for module
const orders = {};

// Base directory for .data
const baseDir = path.join(__dirname, '/../../.data');

// Get all orders from the database.
orders.getAllOrders = async (userId) => {
  const orders = await Orders.find({ userId }).exec();
  return orders;
}

// Save orders to the database.
orders.saveOrders = async (orders, userId) => {
  // Loop through orders
  for(const order of orders) {
    order.marketplace = 'woocommerce'; // Currently setting marketplace manually. Change to be dynamic.
    
    // Await found orders
    const finds = await Orders.find( { marketplaceID: order.id } ).exec();
    
    // Get order items for shipFrom address
    for(const item of order.line_items) {
      // console.log(item.sku);
      const shipFrom = await Products.findOne({ sku: item.sku, userId: userId }).exec();
      console.log(shipFrom.location);
      // If finds === 0, order does not exist in database
      if(finds.length === 0) {
        // Create the order object
        const orderObj = {
          marketplaceID: order.id,
          marketplace: order.marketplace,
          billing: {
            firstName: order.billing.first_name,
            lastName: order.billing.last_name,
            company: order.billing.company,
            address1: order.billing.address_1,
            address2: order.billing.address_2,
            city: order.billing.city,
            state: order.billing.state,
            zip: order.billing.postcode,
            country: order.billing.country,
            email: order.billing.email,
            phone: order.billing.phone
          },
          shipping: {
            firstName: order.shipping.first_name,
            lastName: order.shipping.last_name,
            company: order.shipping.company,
            address1: order.shipping.address_1,
            address2: order.shipping.address_2,
            city: order.shipping.city,
            state: order.shipping.state,
            zip: order.shipping.postcode,
            country: order.shipping.country
          },
          shipFrom: {
            company: shipFrom.location.company,
            name: shipFrom.location.name,
            address1: shipFrom.location.address1,
            address2: shipFrom.location.address2,
            city: shipFrom.location.city,
            state: shipFrom.location.state,
            zip: shipFrom.location.zip,
            country: shipFrom.location.country,
            email: shipFrom.location.email,
            phone: shipFrom.location.phone
          },
          orderItems: order.line_items,
          currency: order.currency,
          total: order.total,
          totalTax: order.total_tax,
          shippingTotal: order.shipping_total,
          refunds: order.refunds,
          paymentMethod: order.payment_method,
          paidDate: order.date_paid,
          createdDate: order.date_created,
          modifiedDate: order.date_modified,
          completedDate: order.date_completed,
          status: order.status,
          userId: userId
        }
        // Insert order object to database
        await Orders.create(orderObj);
        
      }
    }


  }

}

orders.updateOrders = async (orders, options, userId) => {

  // Loop through the orders passed in
  for(const order of orders) {
    // Get `marketplaceID` for order
    const { marketplaceID } = order;

    // Look through each orderItem
    for(const orderItem of order.orderItems) {
      // Get `product_id`, `quantity` for orderItem
      const { product_id, quantity } = orderItem;

      // Get products
      const products = await Products.find({ sku: orderItem.sku, userId }).exec();

      // Loop through each product
      for(const product of products) {
        // Get `_id`, linked: `woocommerce` for product
        let { _id, linked: { woocommerce } } = product;

        // Check to see if the product is linked
        const linked = woocommerce.find(x => x.id === product_id);

        // If the product is linked
        if(linked) {

          if(options === 'completed') {
            // Subtract the product quantity with orderItem quantity
            product.quantity.quantity -= quantity;

            // Get the index of matching order in product.orders
            const orderIndex = product.orders.map(y => y.marketplaceID).indexOf(marketplaceID);

            if(orderIndex > -1) {
              // Remove the order from product.orders
              product.orders.splice(orderIndex, 1);
            }

          }

          if(options !== 'completed') {
            // Add the product quantity with the orderItem quantity
            product.quantity.quantity += quantity;

            // Attempt to find order
            const findOrder = product.orders.find(y => y.marketplaceID === marketplaceID);

            // If order is not found in product.orders
            if(!findOrder) {
              // Add the order into the array
              product.orders.push(order);
            }

          }

        }
        // Update product.quantity.pendingOrders
        product.quantity.pendingOrders = product.orders.length

        await Products.update({ _id }, product).exec();
      }
    }
    // Update the status of each order
    await Orders.update({ _id: order._id, userId: userId }, { status: options }).exec();
  }
  
}

orders.deleteOrders = async (orders) => {
  // If orders is a string it is a single order
  if(typeof orders === 'string') {
    // Delete the single order
    await Orders.findByIdAndDelete(orders).exec();
  } else {
    // Loop through orders
    for(const order of orders) {
      await Orders.find({ _id: order._id }).remove().exec();
    }
  }

}

orders.getOrdersByStatus = async (status, userId) => {
  const orders = await Orders.find({status: status, userId: userId});
  return orders;
}

// Get the exact date to the second during execution
const dateNow = Date.now();
// Creating date in chosen format
const date = new Date(), currMonth = date.getMonth()+1, currDate = date.getDate(), currYear = date.getFullYear();
const fullDate = `${currMonth.toString()}-${currDate.toString()}-${currYear.toString()}`;

// Flag for keep track of folders created for that day
let today = 0;

// Create Order Labels
orders.createOrderLabels = async (orders, user) => {
  // User pitney token
  const auth = user.tokens.pitneyBowesAuthToken;

  function processOrders() {
    return new Promise((resolve, reject) => {
      /* When completed change `i` to completed. For pitney unique transaction ID use a order number of some sort */
      let i = 1;
      // Loop through orders
      for(const order of orders) {
        // Address verification options
        const verify = httpReq.httpOptions('api-sandbox.pitneybowes.com', 443, '/shippingservices/v1/addresses/verify', 'POST', {
          'Authorization': `Bearer  ${auth}`,
          'Content-Type': 'application/json'
        });
    
        // Address verification data
        const verifyData = JSON.stringify({
          "addressLines": [
            order.billing.address1,
            order.billing.address2
          ],
          "cityTown": order.billing.city,
          "stateProvince": order.billing.state,
          "postalCode": order.billing.zip,
          "countryCode": order.billing.country,
          "company": "Company placeholder",
          "name": order.billing.firstName,
          "phone": order.billing.phone,
          "email": order.billing.email,
          "residential": false
        });
    
        // Address verification http request
        httpReq.retrieve(verify, verifyData, (err, verified) => {
          if(err) console.log(err);
          
          // Print options
          const print = httpReq.httpOptions('api-sandbox.pitneybowes.com', 443, '/shippingservices/v1/shipments?includeDeliveryCommitment=true', 'POST', {
            'Authorization': `Bearer  ${auth}`,
            'Content-Type': 'application/json',
            'X-PB-TransactionId': `X-PB-ID-${dateNow}-${i}`
          });
          
          // Print data
          const printData = JSON.stringify({
            "fromAddress" : {
              "company" : order.shipFrom.company,
              "name" : order.shipFrom.name,
              "phone" : order.shipFrom.phone,
              "email" : order.shipFrom.email,
              "residential" : false,
              "addressLines" : [ order.shipFrom.address1, order.shipFrom.address2 ],
              "cityTown" : order.shipFrom.city,
              "stateProvince" : order.shipFrom.state,
              "postalCode" : order.shipFrom.zip,
              "countryCode" : order.shipFrom.country
            },
            "toAddress": {
                "company": verified.company,
                "name": verified.name,
                "phone": verified.phone,
                "email": verified.email,
                "residential": false,
                "addressLines": verified.addressLines,
                "cityTown": verified.cityTown,
                "stateProvince": verified.stateProvince,
                "postalCode": verified.postalCode,
                "countryCode": verified.countryCode
            },
            "parcel": {
                "weight": {
                    "unitOfMeasurement": "OZ",
                    "weight": 8
                },
                "dimension": {
                    "unitOfMeasurement": "IN",
                    "length": 6.0,
                    "width": 1.0,
                    "height": 4.0
                },
                "valueOfGoods" : 101.56,
                "currencyCode" : "USD"
            },
            "rates": [ {
                "carrier": "USPS",
                "serviceId": "FCM",
                "parcelType": "PKG",
                "specialServices": [ {
                    "specialServiceId": "DelCon",
                    "inputParameters": [ {
                        "name": "INPUT_VALUE",
                        "value": "0"
                    } ]
                } ],
                "inductionPostalCode": "06484"
            } ],
            "documents": [ {
                "type": "SHIPPING_LABEL",
                "contentType": "BASE64",
                "size": "DOC_4X6",
                "fileFormat": "PNG",
                "printDialogOption": "NO_PRINT_DIALOG"
            } ],
            "shipmentOptions": [ {
                "name": "SHIPPER_ID",
                "value": process.env.PB_SHIPID
            }, {
                "name": "ADD_TO_MANIFEST",
                "value": "true"
            }, {
                "name": "MINIMAL_ADDRESS_VALIDATION",
                "value": "true"
            } ]
          });
          
          // Get print label
          httpReq.retrieve(print, printData, (err, label) => {
            if(err) reject(err);
            
            const image = label.documents[0].pages[0].contents;

            // If todays date directory does not exist
            if (!fs.existsSync(`${baseDir}/orders/${fullDate}`)){
              // Create directory
              fs.mkdirSync(`${baseDir}/orders/${fullDate}`);
            }

            // // if today flag does not exist
            // if (!fs.existsSync(`${baseDir}/orders/${fullDate}/${today}`)){
            //   // Create todays directory
            //   fs.mkdirSync(`${baseDir}/orders/${fullDate}/${today}`);
            //   today++
            // }

            // Save label as png
            fs.writeFile(`${baseDir}/orders/${fullDate}/${dateNow}-${i}.png`, image, 'base64', function(err) {
              if(err) {
                reject(err);
              }
              i++;
              if(i-1 === orders.length) {
                resolve();
              };

            });
          });
        });
      }
    });
  }
  await processOrders();

}

// Save files to pdf
orders.printOrderLabels = async () => {
  // PDF creation
  const pdf = new PDFKit({
    size: 'LEGAL',
    layout: 'portrait',
    size: [288, 432] // 72 === 1 inch
  });

  function mergeLabels() {
    return new Promise((resolve, reject) => {
      let i = 0;
      fs.readdir(`${baseDir}/orders/${fullDate}`, (err, fileNames) => {
        if(err) {
          reject(err);
        }
        for(const file of fileNames) {
          // If first loop
          if(i === 0) {
            pdf.image(`${baseDir}/orders/${fullDate}/${file}`, 0, 0, {
              width: 288,
              height: 432
            });
          } else {
            pdf.addPage().image(`${baseDir}/orders/${fullDate}/${file}`, 0, 0, {
              width: 288,
              height: 432
            });
          }
          i++
          if(i === fileNames.length-1) {
            resolve();
          }
        }
        
      });
    });
  }
  await mergeLabels();
  pdf.end();
  pdf.pipe(fs.createWriteStream(`${baseDir}/orders/${fullDate}/labels.pdf`));

}

module.exports = orders;

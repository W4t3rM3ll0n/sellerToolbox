'use strict'
const PDFKit = require('pdfkit');
const fs = require('fs');

const Orders = require('../../models/order');
const Products = require('../../models/products');
const httpReq = require('../../config/httpReq');

module.exports = {

  // Get all orders from the database.
  getAllOrders: async (userId) => {
    const orders = await Orders.find({ userId }).exec();
    return orders;
  },

  // Save orders to the database.
  saveOrders: async (orders, userId) => {
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

  },

  updateOrders: async (orders, options, userId) => {

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
		
  },

  deleteOrders: async (orders) => {
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

	},

  getOrdersByStatus: async (status, userId) => {
		const orders = await Orders.find({status: status, userId: userId});
		return orders;
  },

  createOrderLabels: async (orders, user) => {
    // User pitney token
    const auth = user.tokens.pitneyBowesAuthToken;

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
      await httpReq.retrieve(verify, verifyData, async (err, verified) => {
        if(err) throw err;
        
        // Print options
        const print = httpReq.httpOptions('api-sandbox.pitneybowes.com', 443, '/shippingservices/v1/shipments?includeDeliveryCommitment=true', 'POST', {
          'Authorization': `Bearer  ${auth}`,
          'Content-Type': 'application/json',
          'X-PB-TransactionId': `TEST080418-1-${i}`
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
              "value": 9015330830
          }, {
              "name": "ADD_TO_MANIFEST",
              "value": "true"
          }, {
              "name": "MINIMAL_ADDRESS_VALIDATION",
              "value": "true"
          } ]
        });

        // Get print label
        await httpReq.retrieve(print, printData, async (err, label) => {
          if(err) throw err;

          const image = label.documents[0].pages[0].contents;

          // Save label as png
          fs.writeFile(`${__dirname}/testing${i}.png`, image, 'base64', function(err) {
            console.log(err);
          });
          i++;
          await i === orders.length;
        });

      });
    }

  },

  // Save files to pdf
  printOrderLabels: async () => {

    // PDF creation
    const pdf = new PDFKit({
      size: 'LEGAL',
      layout: 'portrait',
      size: [288, 432] // 72 === 1 inch
    });

    pdf.image(`${__dirname}/testing1.png`, 0, 0, {
      width: 288,
      height: 432
    });

    pdf.addPage().image(`${__dirname}/testing2.png`, 0, 0, {
      width: 288,
      height: 432
    });
    pdf.addPage().image(`${__dirname}/testing3.png`, 0, 0, {
      width: 288,
      height: 432
    });
    pdf.addPage().image(`${__dirname}/testing4.png`, 0, 0, {
      width: 288,
      height: 432
    });

    pdf.end();

    pdf.pipe(fs.createWriteStream(`${__dirname}/test1.pdf`));
  }

}

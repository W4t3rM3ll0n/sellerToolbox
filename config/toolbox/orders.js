'use strict'
const Orders = require('../../models/order');
const Products = require('../../models/products');

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

  printOrders: async (orders, userId) => {
    // The logic to print orders to dazzle
    for(const order of orders) {
      console.log(order.billing);
    }
  },
  
}

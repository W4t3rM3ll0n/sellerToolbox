'use strict'
const Orders = require('../../models/order');
const Products = require('../../models/products');

module.exports = {

    // Get all orders from the database.
    getAllOrders: (userId, callback) => {
        Orders.find({userId: userId})
            .then(orders => callback(null, orders))
        .catch(err => callback(err, null));
    },

    getOrdersByStatus(status, userId, callback) {
        Orders.find({status: status, userId: userId})
            .then(orders => callback(null, orders))
        .catch(err => callback(err, null));
    },

    // Save orders to the database.
    saveOrders: (orders, userId, callback) => {
        
        // Returns a promise which resolves to an array of orders.
        function createOrders(orders) {
            // Increment the count during each loop. When count is equal to the length of the order array then resolve the promise.
            let count = 0;
            return new Promise((resolve, reject) => {
                // Array which holds the orders that need to be created in the database.
                const ordersList = []
                // Loop through orders array.
                orders.forEach(order => {
                    // Currently we are manually setting the marketplace. Make sure to make this dynamic depending on which marketplace the order is coming from.
                    order.marketplace = 'woocommerce';
                    // Query the database to match if an order in the db matches the order.id which needs to be created.
                    Orders.find({marketplaceID: order.id})
                        .then((each) => {
                            // For each order from the database, if the length equals 0 that means the order does not exist in the database.
                            if(each.length === 0) {
                                // Create the order object that will be saved to the database.
                                const orderObj = {
                                    marketplaceID: order.id,
                                    marketplace: order.marketplace,
                                    billing: order.billing,
                                    shipping: order.shipping,
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
                                // Push the order object into the ordersList [].
                                ordersList.push(orderObj);
                            }
                            // Increment the count to check when to resolve.
                            count++
                            count === orders.length ? resolve(ordersList) : null;
                        })
                    .catch(err => reject(err));
                });
            })
        }
        
        // Call the createOrders function while passing in the orders array from this parents function parameter
            // @orders - orders array parameter.
        createOrders(orders)
            // ordersRes [] is the resolved promise of orders that need to be created in the database.
            .then((ordersRes) => {
                if(ordersRes.length > 0) {
                    Orders.insertMany(ordersRes)
                        .then((saved) => {
                            callback(null, saved);
                        })
                    .catch(err => callback(err, null));
                } else {
                    callback('There are no orders to save', null);
                }
            })
        .catch(err => callback(err, null));

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

    // Merge deleteSingleOrder && deleteOrders into one method.
    deleteSingleOrder(orderID, callback) {
        Orders.findByIdAndDelete(orderID)
            .then(deleted => callback(null, deleted))
        .catch(err => callback(err, null));
    },
    // Merge deleteSingleOrder && deleteOrders into one method.
    deleteOrders(orders, callback) {
        function deleteMultiOrders() {
            return new Promise((resolve, reject) => {
                orders.forEach((order) => {
                    Orders.find({_id: order._id}).remove()
                        .then((deleted) => {
                            resolve(deleted);
                        })
                    .catch(err => reject(err));
                });
            });
        }

        deleteMultiOrders()
            .then(deleted => {
                callback(null, deleted);
            })
        .catch(err => callback(err, null));
    },
    
}

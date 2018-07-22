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

    updateOrders(orders, options, userId, callback) {
        // Loop through orders array passed from this parameter.
        if(options === 'completed') {
            const itemSKUInOrder = [];
            const ordersToRemove = [];

            // Get orders to remove from linked products.
            function getOrdersToRemove() {
                return new Promise((resolve, reject) => {
                    let productQueryFlag = 0;
                    let orderItemLength = 0;
                    // Loop through the orders passed in from the parameter. Sort it by marketplaceID.
                    orders.sort((a, b) => { return a.marketplaceID - b.marketplaceID }).forEach(order => {
                        // console.log(order.marketplaceID);
                        ordersToRemove.push({ marketplaceID: order.marketplaceID });
                        orderItemLength += order.orderItems.length;
                        // console.log(order.marketplaceID);
                        // Loop through each item from the orders that were passed.
                        order.orderItems.forEach(orderItem => {
                            // console.log(orderItem);
                            // Find the product in the database based off each item from the order.
                            Products.findOne({ sku: orderItem.sku, userId, userId}).then(foundProduct => {
                                // console.log(foundProduct);
                                // If the product is found in the database.
                                if(foundProduct !== null) {
                                    // Check to see if the product is linked with a marketplace. 
                                    // Search the linked product inside product and compare the id with the orderItem products id.
                                    const linkedItemIndex = foundProduct.linked.woocommerce.map(linkedItem => {
                                        return linkedItem.id;
                                    }).indexOf(orderItem.product_id);

                                    if(linkedItemIndex > -1) {
                                        // Push each item sku and quantity from the order into itemSKUInOrder [].
                                        itemSKUInOrder.push({ sku: orderItem.sku, quantity: orderItem.quantity });
                                    } else itemSKUInOrder.push({ sku: null, quantity: null });;

                                    productQueryFlag++

                                } else { productQueryFlag++; console.log('Product not found'); };

                                // If program has looped the same amount of time there are products in the order.
                                productQueryFlag === orderItemLength ? resolve() : null;;

                            }).catch(err => reject(err));
                        });
                        Orders.update({ _id: order._id, userId: userId }, { status: options }, (err, updated) => err ? reject(err) : false);
                    });
                });
            }

            function removeAndUpdateOrders() {
                return new Promise((resolve, reject) => {
                    let resolveUpdateFlag = 0;
                    // Loop through the items that are linked in the database.
                    if(itemSKUInOrder.length > 0) {
                        itemSKUInOrder.forEach(item => {
                            resolveUpdateFlag++
                            if(item.sku !== null) {
                                Products.findOne({ sku: item.sku, userId: userId }).then(productToUpdate => {
                                    // console.log(productToUpdate);
                                    // Get each order in the product to be removed.
                                    ordersToRemove.forEach(order => {
                                        const removeOrderIndex = productToUpdate.orders.map(eachOrder => {
                                            return eachOrder.marketplaceID;
                                        }).indexOf(order.marketplaceID);
        
                                        if(removeOrderIndex > -1) {
                                            productToUpdate.orders.splice(removeOrderIndex, 1);
                                            productToUpdate.quantity.pendingOrders = productToUpdate.orders.length;
                                            console.log(item.quantity);
                                            productToUpdate.quantity.quantity -= item.quantity;
                                            productToUpdate.save();
                                        } else return false;
                                    });
                                }).catch(err => reject(err));
                            };

                            if(resolveUpdateFlag === itemSKUInOrder.length) {
                                resolve();
                            }

                        });
                    } else { console.log('No orders to be removed'); resolve(); };
                });
            }

            getOrdersToRemove()
                .then(() => {
                    return removeAndUpdateOrders();
                })
                .then(() => {
                    callback(null, 'done');
                })
            .catch(err => callback(err, null));

        } else {
            let updateQty = 0;
            // Loop through the orders object from the orders parameter
            orders.forEach((order) => {
                // Loop through orderItems array of each order from the orders parameter
                order.orderItems.forEach((orderItem) => {
                    // Find the sku item that matches the orderItem
                    Products.findOne({sku: orderItem.sku, userId: userId})
                        .then((foundProduct) => {
                            // Check to see if the found sku is linked
                            const linkedIndex = foundProduct.linked.woocommerce.map((linked) => {
                                return linked.id;
                            }).indexOf(orderItem.product_id);
                            // If the item is linked in the back end
                            if(linkedIndex > -1) {
                                updateQty += orderItem.quantity;
                            } else return false;

                            // console.log(updateQty);
                            foundProduct.quantity.pendingOrders += 1;
                            foundProduct.quantity.quantity += updateQty;
                            foundProduct.save();
                        })
                        .catch(err => console.log('No items found that are linked: ' +err));
                    });
                    Orders.update({ _id: order._id, userId: userId }, { status: options }, (err, updated) => {
                        err ? callback(err, null) : null;
                    });
                });
                callback(null, 'Orders have been updated');
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

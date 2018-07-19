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
            const matchedOrdersToBeRemoved = [];
            const itemSKUInOrder = [];

            // Get to orders to be removed from the product.orders array.
            const getOrdersToRemove = () => {
                return new Promise((resolve, reject) => {
                    // Sort and loop through the orders that were passed in from the parameter.
                    orders.sort((a, b) => { return a.marketplaceID - b.marketplaceID }).forEach(order => {
                        // Loop through each item inside of the order.
                        order.orderItems.forEach(orderItem => {
                            // Find the products by sku from the items inside each order.
                            Products.find({ sku: orderItem.sku, userId: userId }).then(foundProducts => {
                                // Loop through the found products to analyze each one.
                                foundProducts.forEach(product => {
                                    // Checking to make sure the passed product from the order is a linked item in the backen.
                                    const linkedItemIndex = product.linked.woocommerce.map(linkedItem => {
                                        return linkedItem.id;
                                    }).indexOf(orderItem.product_id);

                                    // If the item is confirmed and linked.
                                    if(linkedItemIndex > -1) {
                                        itemSKUInOrder.push(orderItem.sku);
                                        // Check to see if the orders that is passed in matches a order inside of the products model.
                                        const matchedOrderIndex = product.orders.sort((a, b) => { return a.marketplaceID - b.marketplaceID }).map(ordersInProduct => {
                                            return ordersInProduct.marketplaceID;
                                        }).indexOf(order.marketplaceID);
                                        
                                        if(matchedOrderIndex > -1) {
                                            // Getting all the orders that are matched to be removed
                                            matchedOrdersToBeRemoved.push(...product.orders.splice(matchedOrderIndex, 1));
                                        } else return false;
    
                                    } else return false;

                                    // Check through each loop if the 2 arrays match in length. This section causes hang time if there are no orders inside a product.
                                    // I think it can be fixed by updating the product at all possible locations the orders length can change.
                                    matchedOrdersToBeRemoved.length === orders.length ? resolve() : null;
                                })
                            }).catch(err => reject(err));
                        });
                    });
                })
            }

            const removeAndUpdateOrders = () => {
                return new Promise((resolve, reject) => {
                    itemSKUInOrder.forEach((item) => {
                        Products.findOne({sku: item, userId: userId}, (err, product) => {
                            if(err) reject(err);
                            matchedOrdersToBeRemoved.forEach(matchedOrder => {
                                const index = product.orders.sort((a, b) => { return a.marketplaceID - b.marketplaceID }).map(order => {
                                    return order.marketplaceID;
                                }).indexOf(matchedOrder.marketplaceID);
    
                                if(index > -1) {
                                    product.quantity.quantity = product.quantity.quantity - 1;
                                    product.orders.splice(index, 1);
                                } else return false;

                                Orders.update({ _id: matchedOrder._id, userId: userId }, { status: options }, err => err ? reject(err) : false);

                            });
                            product.quantity.pendingOrders = product.orders.length;
                            product.save()
                            resolve()
                        })
                    })
                });
            }

            getOrdersToRemove().then(() => {
                return removeAndUpdateOrders();
            }).then(() => {
                callback(null, 'done');
            }).catch(err => callback(err, null));

        } else {
            orders.forEach((order) => {
                // Loop through orderItems array of each order from the orders parameter
                order.orderItems.forEach((item) => {
                    // Find the sku item that matches the orderItem
                    Products.findOne({sku: item.sku, userId: userId})
                        .then((found) => {
                            // Check to see if the found sku is linked.
                            const linkedIndex = found.linked.woocommerce.map((linked) => {
                                return linked.id;
                            }).indexOf(item.product_id);
                            // If the item is linked in the back end.
                            if(linkedIndex > -1) {
                                // Subract the total quantity available with the item quantity from marketplace.
                                found.quantity.quantity = found.quantity.quantity - item.quantity;
                                found.save();
                            } else return false;
                            console.log(found.orders.length);
                            found.quantity.pendingOrders = found.orders.length;
                            // console.log(found.orders.length);
                            
                        })
                        .catch(err => console.log('No items found that are linked: ' +err));
                    });
                    Orders.update({ _id: order._id, userId: userId }, { status: options }, (err, updated) => {
                        err ? callback(err, null) : null;
                    })
                });
                callback(null, 'Orders have been updated');
        }

        // Loop through orders array passed from this parameter
        // if(options === 'completed') {
            // orders.forEach((order) => {
            //     // Loop through orderItems array of each order from the orders parameter
            //     order.orderItems.forEach((item) => {
            //         // Find the sku item that matches the orderItem
            //         Products.findOne({sku: item.sku, userId: userId})
            //             .then((found) => {
            //                 // Check to see if the found sku is linked.
            //                 const linkedIndex = found.linked.woocommerce.map((linked) => {
            //                     return linked.id;
            //                 }).indexOf(item.product_id);
            //                 // If the item is linked in the back end.
            //                 if(linkedIndex > -1) {
            //                     // Subract the total quantity available with the item quantity from marketplace.
            //                     found.quantity.quantity = found.quantity.quantity - item.quantity;
            //                     // Trying to remove orders inside item and update pendingOrders. Currently can not do in bulk.
            //                     const ordersInProductIndex = found.orders.map(eachOrder => eachOrder.marketplaceID).indexOf(order.marketplaceID);
            //                     found.orders.splice(ordersInProductIndex, 1);

            //                     // found.orders.forEach((eachOrder) => {
            //                     //     if(eachOrder.marketplaceID === order.marketplaceID) {
            //                     //         // test.push()
            //                     //         console.log(eachOrder);
            //                     //     };
            //                     // });

            //                     found.save();
            //                 } else return false;
            //                 console.log(found.orders.length);
            //                 found.quantity.pendingOrders = found.orders.length;
            //                 // console.log(found.orders.length);
                            
            //             })
            //             .catch(err => console.log('No items found that are linked: ' +err));
            //         });
            //         Orders.update({ _id: order._id, userId: userId }, { status: options }, (err, updated) => {
            //             err ? callback(err, null) : null;
            //         })
            //     });
            //     callback(null, 'Orders have been updated');
            // }

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

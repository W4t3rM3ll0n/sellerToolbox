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

        const foundProducts = [];
        const updateInfo = [];

        const getProductsAndInfo = new Promise((resolve, reject) => {
            // Loop through the orders that are passed from the parameter.
            orders.forEach((order, index) => {
                order.orderItems.forEach(orderItem => {
                    // Find each product by sku from the order items.
                    Products.findOne({sku: orderItem.sku, userId: userId})
                        .then(foundProduct => {
                            if(foundProduct !== null) {
                                // Check if the item in the database is linked.
                                const linkedItemIndex = foundProduct.linked.woocommerce.map(linkedItem => {
                                    return linkedItem.id;
                                }).indexOf(orderItem.product_id);
                                if(linkedItemIndex > -1) {
                                    // Get the index of the foundProduct compared to the foundProducts [].
                                    const productIndex = foundProducts.map(product => {
                                        return product.sku;
                                    }).indexOf(foundProduct.sku);
                                    // If the product that was found does not already exist in the foundProducts [].
                                    if(productIndex < 0) {
                                        // Push the products that were found in the database that also exist in the order.
                                        foundProducts.push(foundProduct);
                                    };
                                    // console.log(orderItem);
                                    updateInfo.push({ sku: orderItem.sku, quantity: orderItem.quantity, marketplaceID: order.marketplaceID });
                                };
                                if(index === orders.length - 1) resolve();
                            } else console.log('Product not found');
                        })
                    .catch(err => reject(err));
                });
                Orders.update({ _id: order._id, userId: userId }, { status: options }).then().catch(err => reject(err));
            });
        });

        const updateProducts = () => {
            return new Promise((resolve, reject) => {
                // Loop through each product that was found.
                foundProducts.forEach((product, index) => {
                    // Search for a single product based on the product found.
                    Products.findOne({ sku: product.sku, userId: userId })
                        .then(foundProduct => {
                            let updateQty = 0;
                            // Loop through the updateInfo to get the total update quantity based on each item.
                            updateInfo.forEach(item => {
                                if(item.sku === foundProduct.sku) {
                                    updateQty += item.quantity;
                                };
                            });
                            // Update the quantity.
                            if(options === 'completed') {
                                // foundProduct.orders = [];
                                foundProduct.quantity.quantity -= updateQty;
                                foundProduct.save();
                            } else {
                                // foundProduct.orders = [];
                                foundProduct.quantity.quantity += updateQty;
                                foundProduct.save();
                            }
                        })
                    .catch(err => reject(err));
                    if(index === foundProducts.length - 1) resolve();
                });
            });
        }

        const removeOrdersOrAddFromProduct = () => {
            return new Promise((resolve, reject) => {
                // Loop through the foundProducts []. Contains found product at the current state in database.
                foundProducts.forEach(foundProduct => {
                    // Loop through the updateInfo []. Update info contains sku, qty & marketplaceID from current state of order.
                    updateInfo.forEach((item, index, array) => {
                        // If the foundProduct orders matches the updateInfo's item.marketplaceID the get the index.
                        const orderItemIndex = foundProduct.orders.map(eachOrder => {
                            return eachOrder.marketplaceID;
                        }).indexOf(item.marketplaceID);
                        // If its a match and the index is greater than 0 then splice the order out of foundProduct orders.
                        if(orderItemIndex > -1 && options === 'completed') {
                            foundProduct.orders.splice(orderItemIndex, 1);
                        } 
                        
                        /* Currently we can not mark as processing and update the product orders */
                        /* else if (options !== 'completed') { // Have to put this condition because orders is empty sometimes during testing.
                            // Here we are going to update the Product when marked as processing or other order status. We need to push the orders into the Product.orders.
                            Orders.findOne({ marketplaceID: item.marketplaceID })
                                .then(orderToBeUploaded => {
                                    const orderIndex = foundProduct.orders.map(eachOrder => {
                                        return eachOrder.marketplaceID
                                    }).indexOf(orderToBeUploaded.marketplaceID);

                                    if(orderIndex < 0) {
                                        foundProduct.orders.push(orderToBeUploaded);
                                    };

                                })
                            .catch(err => reject(err));
                        } */

                        if(index === array.length - 1) {
                            // After the loop above is completed update the Products based on the resulted object of foundProduct.
                            console.log(foundProduct);
                            foundProduct.quantity.pendingOrders = foundProduct.orders.length;
                            Products.update({sku: foundProduct.sku}, foundProduct)
                                .then(() => {
                                    resolve();
                                })
                            .catch(err => reject(err));
                        }
                    });
                });
            });
        }

        getProductsAndInfo.then(() => {
                return updateProducts();
            })
            .then(() => {
                return removeOrdersOrAddFromProduct();
            })
            .then(() => {
                callback(null, 'done');
            })
        .catch(err => console.log(err));

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

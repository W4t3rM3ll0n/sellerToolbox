'use strict'

const Products = require('../../models/products');
const Orders = require('../../models/order');

module.exports = {

    // Default updates for items such as pending orders, available quantity, etc...
    syncInventory: async (userId, callback) => {

        // This stores the products found from getProducts, products is found with userId.
        const foundProducts = [];

        // Get the products that need to be updated based on the user.
        // (1)
        const getProducts = new Promise((resolve, reject) => {

            let productQuery = Products.find({ userId: userId });

            productQuery.exec()
                .then((products) => {
                    // For each product found push it into foundProducts [].
                    products.forEach((product, index, array) => {
                        foundProducts.push(product);
                        if(foundProducts.length === array.length) resolve('Success: Get Products Completed');
                    });
                })
            .catch(err => reject(err));

        });

        // Update quantity and pending orders.
        // (2)
        function updateQtys() {
            return new Promise((resolve, reject) => {
                // Loop through the foundProducts array.
                foundProducts.forEach((foundProduct, foundProductsIndex, foundProductsArray) => {
                    // Update the neededQuantity. If the alertQuantity - quantity is > 0 then we alertQuantity - quantity else 0;
                    foundProduct.quantity.neededQuantity = foundProduct.quantity.alertQuantity - foundProduct.quantity.quantity > 0 ? foundProduct.quantity.alertQuantity - foundProduct.quantity.quantity : 0;
                    // Loop through the linked items from the respected marketplace.
                    foundProduct.linked.woocommerce.forEach(linkedItem => {
                        let ordersQuery = Orders.find({ orderItems: { $elemMatch: { sku: linkedItem.sku } } });
                        // Find the orders that matched the linked item based on its sku.
                        ordersQuery.exec()
                            .then(orders => {
                                let updateAvailableQty = 0;
                                // Loop through each order that were found. Each order is found based on the linked items inside the Product model.
                                orders.forEach(eachOrder => {
                                    // Map each orders marketplaceID that lives in the Product model. Check to see if the orderID matches with each order response.
                                    const pendingOrdersIndex = foundProduct.orders.map(eachProductOrders => eachProductOrders.marketplaceID).indexOf(eachOrder.marketplaceID);
                                    // foundProduct.orders = []; // This clears the array of orders inside a product.
                                    // console.log(pendingOrdersIndex);
                                    // If the order does not exist within the product and if the status is not completed, then we push each order.
                                    if(pendingOrdersIndex < 0 && eachOrder.status !== 'completed') {
                                        // Push the order to the orders section in the Product model.
                                        foundProduct.orders.push(eachOrder);
                                        // console.log(foundProduct.orders.length);
                                        // Update the pendingOrders quantity by specifying the found orders length.
                                        foundProduct.quantity.pendingOrders = foundProduct.orders.length;
                                    } else console.log('Order is already matched with product');
    
                                    eachOrder.orderItems.forEach(orderItem => {
                                        // If the order item is a linked item then add the quantity of that purchased item to updateAvailableQty
                                        if(orderItem.sku === linkedItem.sku && eachOrder.status !== 'completed') {
                                            // console.log(orderItem.sku);
                                            updateAvailableQty += orderItem.quantity;
                                        }
                                    });
    
                                    // Update the availableQuantity.
                                    // console.log(updateAvailableQty);
                                    foundProduct.quantity.availableQuantity = (foundProduct.quantity.quantity - updateAvailableQty);
                                    // console.log(foundProduct.quantity.availableQuantity);
    
                                    // console.log(foundProduct);
                                    Products.update({ _id: foundProduct._id }, foundProduct).then().catch(err => reject(err));
                                });
                            })
                        .catch(err => reject(err));
                    });
                    if(foundProductsIndex === foundProductsArray.length-1) resolve('Success: Update Quantity Completed');
                });
            });
        }

        // Return with the callback().
        try {

            // (1)
            let gotProducts = await getProducts;

            // (2)
            let updatedQtys = await updateQtys();

            let finalCallback = { gotProducts: gotProducts, updateQtys: updatedQtys };

            return callback(null, finalCallback);

        } catch(err) {

            return callback(`${err.name}: ${err.message}`, null);

        }
        
    },

    addProducts: (productsQuery, callback) => {
        const created = [];

        // Create each product that was submitted. Push each product into the 'created' array and pass it to the callback when we init the promise.
        const createProducts = () => {
            return new Promise((resolve, reject) => {

                productsQuery.forEach((product) => {
                    created.push(product);
                    const createProducts = Products(product);
                    createProducts.save((err, response) => {
                        err ? reject(err) : resolve();
                    })
                });
            });
        }

        // Init the promise.
        createProducts()
            .then(() => {
                callback(null, created);
            })
        .catch((err) => {
            callback(err, null);
        });

    },

    updateProducts: (productsQuery, userId, callback) => {
        const updated = [];

        // Update each product from the entire list. Push each product into the 'updated' array and pass it to the callback when we init the promise.
        // Currenty it updates even if there was no edit. Fix it so that it will only update items that have been edited.
        const updateProducts = () => {
            return new Promise((resolve, reject) => {
                productsQuery.forEach((product) => {
                    updated.push(product);
                    const update = {
                        sku: product.sku,
                        title: product.title,
                        quantity: {
                            quantity: product.quantity.quantity,
                            availableQuantity: product.quantity.availableQuantity,
                            alertQuantity: product.quantity.alertQuantity,
                            pendingOrders: product.quantity.pendingOrders,
                            neededQuantity: product.quantity.alertQuantity - product.quantity.quantity > 0 ? product.quantity.alertQuantity - product.quantity.quantity : 0
                        },
                        description: product.description,
                        price: {
                          sellPrice: 0,
                          purchasePrice: product.price.purchasePrice,
                          stockValue: product.price.stockValue
                        },
                        category: product.category,
                        variationGroup: product.variationGroup,
                        upc: product.upc,
                        barcode: product.barcode,
                        images: product.images,
                        condition: product.condition,
                        location: product.location,
                        detail: {
                            weight: product.detail.weight,
                            height: product.detail.height,
                            width: product.detail.width,
                            depth: product.detail.depth
                        },
                        binLocation: product.binLocation,
                        monitor: product.monitor,
                        modifiedDate: product.modifiedDate,
                    }
                    Products.update({_id: product.id, userId: userId}, update, (err, item) => {
                       err ? reject(err) : resolve(item);
                    });
                });
            });
        }
        updateProducts()
            .then(() => {
                callback(null, updated);
            })
        .catch((err) => {
            callback(err, null);
        });

    },

    getProducts: (userId, callback) => {

        Products.find({userId: userId}).exec()
            .then((products) => {
                callback(null, products);
            })
        .catch((err) => {
            callback(err, null);
        });

    },

    deleteProducts: (products, userId, callback) => {

        if(typeof products === 'string') {
            // Get the products to be deleted from Angular then delete it.
            Products.find({_id: products, userId: userId}).remove().exec()
                .then((deleted) => {
                    callback(null, deleted);
            }).catch((err) => {
                callback(err, null);
            });
        } else {

            const deleteMultiProducts = () => {
                return new Promise((resolve, reject) => {
                    products.forEach((product) => {
                        Products.find({_id: product}).remove().exec()
                            .then((product) => {
                                resolve(product);
                            })
                        .catch((err) => {
                            reject(err);
                        });
                    });
                });
            };

            deleteMultiProducts()
                .then((deleted) => {
                    callback(null, deleted);
                })
            .catch((err) => {
                callback(err, null);
            });
        }

    },

    linkItems(toolboxItem, marketplaceItem, userId, callback) {
        // Currently only works for Woo items. Adjust later for all marketplaces when integrating their apis
        Products.findOne({_id: toolboxItem._id, userId: userId}).exec()
            .then((item) => {
                // item.linked.woocommerce = [];
                // item.save();
                if(item.linked.woocommerce.length > 0) {
                    const index = item.linked.woocommerce.map(each => { return each.id }).indexOf(marketplaceItem.id);
                    if(index > -1) {
                        throw 'This item is already linked.';
                    } else {
                        // item.linked.woocommerce = [];
                        item.linked.woocommerce.push(marketplaceItem);
                        item.save((err, linked) => {
                            err ? callback(err, null) : callback(null, linked);
                        });
                    }
                } else {
                    item.linked.woocommerce.push(marketplaceItem);
                    item.save((err, linked) => {
                        err ? callback(err, null) : callback(null, linked);
                    });
                }
            })
        .catch((err) => {
            callback(err, null);
        })
    },

}

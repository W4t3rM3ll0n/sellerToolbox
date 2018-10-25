'use strict'
// Dependencies
const Products = require('../../models/products');
const Orders = require('../../models/order');

// Instantiate Container
const inventory = {};

// Default updates for items such as pending orders, available quantity, etc...
inventory.syncInventory = async (userId) => {
  // Get the user's products
  const products = await Products.find({ userId }).exec();

  // Loop through each product
  for(const product of products) {
    // Get the `_id`, `alertQuantity` and `quantity` for the product
    const { _id, quantity: { alertQuantity, quantity } } = product;

    // Set the needed quantity for the item (minimum value of 0)
    product.quantity.neededQuantity = Math.max(alertQuantity - quantity, 0);

    // Loop through each linked item
    for(const item of product.linked.woocommerce) {
      // Track stock to reduce
      let reduce = 0;

      // Get all orders for the item
      const orders = await Orders.find({
        orderItems: {
          $elemMatch: {
            sku: item.sku
          }
        }
      }).exec();

      // Loop through each order
      for(const order of orders) {
        // Attempt to find a pending order
        const pending = product.orders.find(x => x.marketplaceID === order.marketplaceID);

        // If the order is pending and does not already exist in product.orders
        if(order.status !== 'completed' && !pending) {
          // Update product.orders []
          product.orders.push(order);
        }
        // Update pending orders count
        product.quantity.pendingOrders = product.orders.length;

        // Loop through each item in the order
        for(const orderItem of order.orderItems) {
          // If the order item is a linked item
          if(order.status !== 'completed' && orderItem.sku === item.sku) {
            // Update the reduce stock
            reduce += orderItem.quantity;
          }
        }
      }
      // Update available stock on the product model
      product.quantity.availableQuantity = quantity - reduce;
    }
    // Update DB
    await Products.update({ _id }, product).exec();
  }
}

// Add products
inventory.addProducts = (productsQuery) => {
  // Create each product that was submitted.
  return new Promise((resolve) => {
    for(const product of productsQuery) {
      const createProducts = Products(product);
      createProducts.save((err) => {
        if(err) {
          resolve({ ok: false, 'Error': err });
        } else {
          resolve({ ok: true, 'Success': 'Product(s) have been created' });
        }
      });
    };
  });
};

// Update products
inventory.updateProducts = (productsQuery, userId) => {
  const updated = [];
  // Update each product from the entire list. Push each product into the 'updated' array
  // Currenty it updates even if there was no edit. Fix it so that it will only update items that have been edited.
  return new Promise((resolve) => {
    for(const product of productsQuery) {
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
        location: {
          fullAddress: product.location.fullAddress,
          company: product.location.company,
          name: product.location.name,
          address1: product.location.address1,
          address2: product.location.address2,
          city: product.location.city,
          state: product.location.state,
          zip: product.location.zip,
          country: product.location.country,
          email: product.location.email,
          phone: product.location.phone
        },
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
        if(err) {
          resolve({ ok: false, 'Error': err });
        } else {
          resolve({ok: true, 'Success': 'Item(s) have been updated'});
        };
      });
    };
  });
};

// Get products
inventory.getProducts = async (userId) => {
  const products = await Products.find({userId: userId}).exec();
  return products;
}

// Delete products
inventory.deleteProducts = (products, userId) => {
  if(typeof products === 'string') {
    return new Promise((resolve) => {
      // Get the products to be deleted from Angular then delete it.
      Products.find({_id: products, userId: userId}).remove((err) => {
        if(err) {
          resolve({ ok: false, 'Error': err });
        } else {
          resolve({ ok: true, 'Success': 'Item has been deleted' });
        }
      });
    });
  } else {
    return new Promise((resolve) => {
      for(const product of products) {
        Products.find({_id: product}).remove((err) => {
          if(err) {
            resolve({ ok: false, 'Error': err });
          } else {
            resolve({ ok: true, 'Success': 'Item\'s have been deleted' });
          }
        });
      }
    });
  };
};

// Link an item
inventory.linkItems = (toolboxItem, marketplaceItem, userId) => {
  return new Promise((resolve) => {
    // Currently only works for Woo items. Adjust later for all marketplaces when integrating their apis
    Products.findOne({_id: toolboxItem._id, userId: userId}, (err, item) => {
      if(err) {
        resolve({ ok: false, 'Error': err });
      } else {
        if(item.linked.woocommerce.length > 0) {
          const index = item.linked.woocommerce.map(each => { return each.id }).indexOf(marketplaceItem.id);
          if(index > -1) {
            resolve({ ok: false, 'Error': 'This item is already linked.' });
          } else {
            item.linked.woocommerce.push(marketplaceItem);
            item.save((err, linked) => {
              if(err) {
                resolve({ ok: false, 'Error': err });
              } else {
                resolve({ ok: true, linked });
              }
            });
          }
        } else {
          item.linked.woocommerce.push(marketplaceItem);
          item.save((err, linked) => {
            if(err) {
              resolve({ ok: false, 'Error': err });
            } else {
              resolve({ ok: true, linked });
            };
          });
        };
      };
    });
  });
};

// Get products from Woocommerce and save to database
inventory.importWooInv = async (products, user) => {
  // Get products from database
  const dbProds = await Products.find({ userId: user._id }).exec();

  return new Promise((resolve) => {
    // Loop through Woo products
    for(const product of products) {
      // Get `values` from product
      const { sku, name, type, manage_stock, stock_quantity, description, images, regular_price, categories, weight, dimensions } = product;
      // Check to see if the product exists in database
      const exist = dbProds.find(x => x.sku === product.sku);
  
      // If the product does not exist
      if(!exist) {
        if(type === 'simple' && manage_stock) {
          // Get the users primary address
          let address;
          for(const addy of user.addresses) {
            if(addy.primary) {
              address = addy;
            };
          };
  
          // Create the object to query to database
          const productQuery = {
            sku: sku,
            title: name,
            quantity: {
              quantity: stock_quantity,
              availableQuantity: stock_quantity,
              alertQuantity: 0,
              pendingOrders: 0,
              neededQuantity: 0
            },
            orders: [],
            description: description,
            upc: '',
            barcode: '',
            images: images[0].src,
            condition: '',
            price: {
              sellPrice: regular_price,
              purchasePrice: 0,
              stockValue: 0
            },
            category: categories[0].name,
            variationGroup: '',
            location: {
              fullAddress: address.fullAddress,
              company: address.company,
              name: address.name,
              address1: address.address1,
              address2: address.address2,
              city: address.city,
              state: address.state,
              zip: address.zip,
              country: address.country
            },
            detail: {
              weight: weight,
              height: dimensions.height,
              width: dimensions.width,
              depth: dimensions.length
            },
            binLocation: '',
            monitor: true,
            createdDate: new Date(),
            userId: user._id
          };
  
          // Persist the product to the database
          Products(productQuery).save(async (err, tbProd) => {
            if(err) {
              resolve({ ok: false, 'Error': err });
            } else {
              await inventory.linkItems(tbProd, product, user._id);
              resolve({ ok: true, 'Success': 'Items have been imported and linked' });
            };
          });
        };
      };
    };
  });
};

module.exports = inventory;

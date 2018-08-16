# Seller Toolbox
A handy seller toolbox which helps online sellers maintain inventory, daily to dos, get analytic reports and more. Both the backend and frontend are housed inside the same repo.

## Getting Started

These instructions will get you up and running for development on your local machine.

### Installing

First clone the repo in your chosen directory.

```
git clone https://github.com/akeon-lee/sellerToolbox.git
```

Then cd into the directory

```
cd /sellerToolbox
```

Install all the dependencies

```
npm install
```

Then from the root, cd into angular-src

```
cd /angular-src
```

Install all the dependencies

```
npm install
```

Done.

### Running the application

Open up two *terminals*

`Terminal 1`

If you have nodemon installed globally run it in the root directory

```
nodemon
```

If you do not simply run it with node

```
node server.js
```

`Terminal 2`

cd into the angular-src from the root directory

```
cd /angular-src
```

Then run ng serve

```
ng serve
```

Open up your chosen browser and see the app at localhost:4200

## Current Featuers

- Inventory/order management with Woocommerce
- Print postage
- Create items with locations and quantity track features
- Track stock of linked items
- Update orders on Woocommerce from the application

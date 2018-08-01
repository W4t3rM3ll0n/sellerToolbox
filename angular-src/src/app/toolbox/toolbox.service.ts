import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ToolboxService {
  jwtToken: string;

  constructor(
    private http: Http
  ) { }

  // Get client auth token from local storage. We call this whenever we need the Bearer token for Passport, then we set authToken to null for security.
  loadToken() {
    const token = localStorage.getItem('id_token');
    this.jwtToken = token;
  }

  // Allow the api call code to be written only once.
  // apiPutCall(contentType, path, postBody, response) {
  //     let headers = new Headers();
  //     this.loadToken();
  //     headers.append('Authorization', this.jwtToken);
  //     headers.append('Content-Type', contentType);
  //     this.jwtToken = null;
  //     return this.http.put('http://localhost:3000'+path, postBody, { headers: headers })
  //         .pipe(
  //             map(res => response(res))
  //         )
  // }

  syncInventory() {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.get('http://localhost:3000/toolbox/inventory/syncInventory', { headers: headers })
      .pipe(
        map(updates => updates.json())
      )  
  }

  createItems(productsDetail) {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.put('http://localhost:3000/toolbox/inventory/createProducts', {products: productsDetail}, { headers: headers })
      .pipe(
        map(products => products.json())
      )
  }

  updateItems(productsDetail) {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.post('http://localhost:3000/toolbox/inventory/updateProducts', {products: productsDetail}, { headers: headers })
      .pipe(
        map(products => products.json())
      )
  }

  getProducts() {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.get('http://localhost:3000/toolbox/inventory/getProducts', { headers: headers })
      .pipe(
        map(products => products.json())
      )
  }

  deleteItems(items: Array<string> | string) {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.post('http://localhost:3000/toolbox/inventory/deleteProducts', {items: items}, { headers: headers })
      .pipe(
        map(deleted => deleted.json())
      )
  }

  getAllOrders() {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.get('http://localhost:3000/toolbox/orders/getAllOrders', { headers: headers })
      .pipe(
        map(orders => orders.json())
      )
  }

  getOrdersByStatus(status) {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.post('http://localhost:3000/toolbox/orders/getOrdersByStatus', { status: status }, { headers: headers })
      .pipe(
        map(orders => orders.json())
      )
  }

  saveOrders(orders) {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.post('http://localhost:3000/toolbox/orders/saveOrders', { orders: orders }, { headers: headers })
      .pipe(
        map(orders => orders.json())
      )
  }

  updateOrders(orders, options) {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.post('http://localhost:3000/toolbox/orders/updateOrders', { orders: orders, options: options }, { headers: headers })
      .pipe(
        map(updated => updated.json())
      )
  }

  deleteSingleOrder(orderID) {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.post('http://localhost:3000/toolbox/orders/deleteOrders', { orderID: orderID }, { headers: headers })
      .pipe(
        map(deleted => deleted.json())
      )
  }

  deleteOrders(orders) {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.post('http://localhost:3000/toolbox/orders/deleteOrders', { orders: orders }, { headers: headers })
      .pipe(
        map(deleted => deleted.json())
      )
  }

  getAllWooOrders() {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.get('http://localhost:3000/woocommerce/getAllOrders', { headers: headers })
      .pipe(
        map(wooOrders => wooOrders.json())
      )
  }

  getWooOrdersByStatus(status) {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.post('http://localhost:3000/woocommerce/getOrdersByStatus', { status: status }, { headers: headers })
      .pipe(
        map(wooOrders => wooOrders.json())
      )
  }

  updateWooOrders(orders?, action?, opt?) {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.post('http://localhost:3000/woocommerce/updateWooOrders', { orders: orders, action: action, options: opt }, { headers: headers })
      .pipe(
        map(wooOrders => wooOrders.json())
      )
  }

  getAllWooProducts() {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.get('http://localhost:3000/woocommerce/getAllProducts', { headers: headers })
      .pipe(
        map(wooProducts => wooProducts.json())
      )
  }

  linkItems(items) {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.post('http://localhost:3000/toolbox/inventory/linkItems', items, { headers: headers })
      .pipe(
        map(items => items.json())
      )
  }

  printOrders(orders: object) {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.post('http://localhost:3000/toolbox/orders/printOrders', { orders: orders }, { headers: headers })
      .pipe(
        map(orders => orders.json())
      )
  }

}

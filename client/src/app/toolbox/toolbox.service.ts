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

  // Set the headers for http call
  httpHeader(contentType) {
      let headers = new Headers();
      this.loadToken();
      headers.append('Authorization', this.jwtToken);
      headers.append('Content-Type', contentType);
      this.jwtToken = null;
      return headers;
  }

  syncInventory() {
    const headers = this.httpHeader('application/json');
    return this.http.get('http://localhost:3000/toolbox/inventory/syncInventory', { headers: headers })
      .pipe(
        map(updates => updates.json())
      )  
  }

  createItems(productsDetail) {
    const headers = this.httpHeader('application/json');
    return this.http.put('http://localhost:3000/toolbox/inventory/createProducts', { products: productsDetail }, { headers: headers })
      .pipe(
        map(products => products.json())
      )
  }

  updateItems(productsDetail) {
    const headers = this.httpHeader('application/json');
    return this.http.post('http://localhost:3000/toolbox/inventory/updateProducts', { products: productsDetail }, { headers: headers })
      .pipe(
        map(products => products.json())
      )
  }

  getProducts() {
    const headers = this.httpHeader('application/json');
    return this.http.get('http://localhost:3000/toolbox/inventory/getProducts', { headers: headers })
      .pipe(
        map(products => products.json())
      )
  }

  deleteItems(items: Array<string> | string) {
    const headers = this.httpHeader('application/json');
    return this.http.post('http://localhost:3000/toolbox/inventory/deleteProducts', {items: items}, { headers: headers })
      .pipe(
        map(deleted => deleted.json())
      )
  }

  getAllOrders() {
    const headers = this.httpHeader('application/json');
    return this.http.get('http://localhost:3000/toolbox/orders/getAllOrders', { headers: headers })
      .pipe(
        map(orders => orders.json())
      )
  }

  getOrdersByStatus(status) {
    const headers = this.httpHeader('application/json');
    return this.http.post('http://localhost:3000/toolbox/orders/getOrdersByStatus', { status: status }, { headers: headers })
      .pipe(
        map(orders => orders.json())
      )
  }

  syncOrders() {
    const headers = this.httpHeader('application/json');
    return this.http.get('http://localhost:3000/toolbox/orders/syncOrders', { headers: headers })
      .pipe(
        map(orders => orders.json())
      )
  }

  updateOrders(orders, options) {
    const headers = this.httpHeader('application/json');
    return this.http.post('http://localhost:3000/toolbox/orders/updateOrders', { orders: orders, options: options }, { headers: headers })
      .pipe(
        map(updated => updated.json())
      )
  }

  deleteSingleOrder(orderID) {
    const headers = this.httpHeader('application/json');
    return this.http.post('http://localhost:3000/toolbox/orders/deleteOrders', { orderID: orderID }, { headers: headers })
      .pipe(
        map(deleted => deleted.json())
      )
  }

  deleteOrders(orders) {
    const headers = this.httpHeader('application/json');
    return this.http.post('http://localhost:3000/toolbox/orders/deleteOrders', { orders: orders }, { headers: headers })
      .pipe(
        map(deleted => deleted.json())
      )
  }

  getAllWooOrders() {
    const headers = this.httpHeader('application/json');
    return this.http.get('http://localhost:3000/woocommerce/getAllOrders', { headers: headers })
      .pipe(
        map(wooOrders => wooOrders.json())
      )
  }

  getWooOrdersByStatus(status) {
    const headers = this.httpHeader('application/json');
    return this.http.post('http://localhost:3000/woocommerce/getOrdersByStatus', { status: status }, { headers: headers })
      .pipe(
        map(wooOrders => wooOrders.json())
      )
  }

  importWooInv() {
    const headers = this.httpHeader('application/json');
    return this.http.get('http://localhost:3000/toolbox/inventory/importWooInv', { headers: headers })
      .pipe(
        map(wooInv => wooInv.json())
      )
  }

  updateWooOrders(orders?, action?, opt?) {
    const headers = this.httpHeader('application/json');
    return this.http.post('http://localhost:3000/woocommerce/updateWooOrders', { orders: orders, action: action, options: opt }, { headers: headers })
      .pipe(
        map(wooOrders => wooOrders.json())
      )
  }

  getAllWooProducts() {
    const headers = this.httpHeader('application/json');
    return this.http.get('http://localhost:3000/woocommerce/getAllProducts', { headers: headers })
      .pipe(
        map(wooProducts => wooProducts.json())
      )
  }

  linkItems(items) {
    const headers = this.httpHeader('application/json');
    return this.http.post('http://localhost:3000/toolbox/inventory/linkItems', items, { headers: headers })
      .pipe(
        map(items => items.json())
      )
  }

  printOrders(orders: object) {
    const headers = this.httpHeader('application/json');
    return this.http.post('http://localhost:3000/toolbox/orders/printOrders', { orders: orders }, { headers: headers })
      .pipe(
        map(orders => orders.json())
      )
  }

}

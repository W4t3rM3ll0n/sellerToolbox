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
    /* apiCall() {
        let headers = new Headers();
        this.loadToken();
        headers.append('Authorization', this.jwtToken);
        headers.append('Content-Type', 'application/json');
        this.jwtToken = null;
    } */

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

}

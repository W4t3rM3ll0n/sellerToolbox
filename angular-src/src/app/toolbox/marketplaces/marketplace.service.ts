import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {
    jwtToken: string;

    constructor(
        private http: Http
    ) { }

    // Get client auth token from local storage. We call this whenever we need the Bearer token for Passport, then we set authToken to null for security.
    loadToken() {
        const token = localStorage.getItem('id_token');
        this.jwtToken = token;
    }

    wooApiTestCall() {
        let headers = new Headers();
        this.loadToken();
        headers.append('Authorization', this.jwtToken);
        headers.append('Content-Type', 'application/json');
        this.jwtToken = null;
        return this.http.get('http://localhost:3000/woocommerce/getOrders', { headers: headers })
            .pipe(
                map(wooIndex => wooIndex.json())
            )
    }

}

import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';

import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class EbayService {
  jwtToken: string;

  constructor(
    private http: Http
  ) { }

  // Get client auth token from local storage. We call this whenever we need the Bearer token for Passport, then we set authToken to null for security.
  loadToken() {
    const token = localStorage.getItem('id_token');
    this.jwtToken = token;
  }

  // Getting Auth and Refresh Token -- Typically for new accounts
  getAuthRefTokens(code) {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.post('https://localhost:3000/ebay/accept', {code: code}, { headers: headers })
      .pipe(
        map(eTokens => eTokens.json())
      )
  }

  // Refresh the auth token with the refresh token from ebay.
  refreshAuthToken() {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.post('https://localhost:3000/ebay/refreshToken', {}, { headers: headers })
      .pipe(
        // We submit the refresh token to receive a new Auth Token.
        map(authToken => authToken.json())
      )
  }

  // Opt into Selling Policy Management (SPM) !! Currently Not Working
  optInToSPM() {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.post('https://localhost:3000/ebay/spm', {}, {headers: headers})
      .pipe(
        map(res => res.json())
      )
  }

  // Get Selling Policy Management (SPM) !! Currently Not Working
  getOptInPrograms() {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.get('https://localhost:3000/ebay/getOptedInPrograms', { headers: headers })
      .pipe(
        map(programs => programs.json())
      )
  }

  // Get Ebay Polices
  getPolicies() {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.get('https://localhost:3000/ebay/getEbayPolicies', { headers: headers })
      .pipe(
        map(policies => policies.json())
      )
  }

  // Making a get request to get an item listed in the sandbox. This is not ebay account specific.
  testCallEbay() {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.get('https://localhost:3000/ebay/testCall', { headers: headers })
      .pipe(
        map(res => res.json())
      )
  }

  /**********************************/
  /***** BEGIN PRODUCTS SECTION *****/
  /**********************************/

  getOffers() {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.get('https://localhost:3000/ebay/getOffers', { headers: headers })
      .pipe(
        map(res => res.json())
      )
  }

  createOrReplaceInventory(products: object, sku: object) {
    let headers = new Headers();
    this.loadToken();
    headers.append('Authorization', this.jwtToken);
    headers.append('Content-Type', 'application/json');
    this.jwtToken = null;
    return this.http.put('https://localhost:3000/ebay/createOrReplaceInventory', { sku: sku, products: products }, { headers: headers })
      .pipe(
        map(res => res.json())
      )
  }

}

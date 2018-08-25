import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../../auth/auth.service';
import { EbayService } from '../../../../ebay/ebay.service';

@Component({
  selector: 'app-tokens',
  templateUrl: './tokens.component.html',
  styleUrls: ['./tokens.component.css']
})
export class TokensComponent implements OnInit {
  tokens: object;

  constructor(
    private authService: AuthService,
    private ebayService: EbayService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  onGetTokens() {
    // redirect to ebay agree page
    window.location.replace('https://auth.sandbox.ebay.com/oauth2/authorize?client_id=AndrewLe-toolBox-SBX-22cd16de6-badedb90&response_type=code&redirect_uri=Andrew_Lee-AndrewLe-toolBo-zlrydfuh&scope=https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/buy.order.readonly https://api.ebay.com/oauth/api_scope/buy.guest.order https://api.ebay.com/oauth/api_scope/sell.marketing.readonly https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.inventory.readonly https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account.readonly https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly https://api.ebay.com/oauth/api_scope/sell.fulfillment https://api.ebay.com/oauth/api_scope/sell.analytics.readonly https://api.ebay.com/oauth/api_scope/sell.marketplace.insights.readonly https://api.ebay.com/oauth/api_scope/commerce.catalog.readonly');
  }

  onRefreshAuthToken() {
    this.ebayService.refreshAuthToken()
      .subscribe(res => {
        console.log(res);
        this.router.navigate(['/user/profile']);
      },
      err => {
        console.log(err);
        return false;
      });
  }

}

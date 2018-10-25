import { Component, OnInit } from '@angular/core';

import { MarketplaceService } from '../marketplace.service';

@Component({
  selector: 'app-woocommerce',
  templateUrl: './woocommerce.component.html',
  styleUrls: ['./woocommerce.component.css']
})
export class WoocommerceComponent implements OnInit {
  testResult: any;

  constructor(
    private marketplaceService: MarketplaceService
  ) { }

  ngOnInit() {
  }

  apiTestCall() {
    // console.log('test call working');
    this.marketplaceService.wooApiTestCall()
      .subscribe((res) => {
        console.log(res);
        this.testResult = res;
      },
      err => {
        console.log(err);
        return false;
      });
  }

}

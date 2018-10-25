import { Component, OnInit } from '@angular/core';

import { EbayService } from '../../ebay/ebay.service';

@Component({
  selector: 'app-test-call',
  templateUrl: './test-call.component.html',
  styleUrls: ['./test-call.component.css']
})
export class TestCallComponent implements OnInit {
  detail: object;

  constructor(
    private ebayService: EbayService
  ) { }

  ngOnInit() {
  }

  testCall() {
    this.ebayService.testCallEbay()
      .subscribe(detail => {
        this.detail = detail;
        console.log(detail);
      },
      err => {
        console.log(err);
        return false;
      });
  }

}

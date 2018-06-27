import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';

import { AuthService } from '../../../../auth/auth.service';
import { EbayService } from '../../../../ebay/ebay.service';

@Component({
  selector: 'app-accept',
  templateUrl: './accept.component.html',
  styleUrls: ['./accept.component.css']
})
export class AcceptComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private ebayService: EbayService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {

    // subscribe to router event
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      let urlCode = params.code;
      this.ebayService.getAuthRefTokens(urlCode)
        .subscribe(res => {
            console.log(res);
        });
    });

  }

}

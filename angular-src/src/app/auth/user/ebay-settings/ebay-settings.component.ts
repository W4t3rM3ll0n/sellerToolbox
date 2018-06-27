import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

import { EbayService } from '../../../ebay/ebay.service';

@Component({
  selector: 'app-ebay-settings',
  templateUrl: './ebay-settings.component.html',
  styleUrls: ['./ebay-settings.component.css']
})
export class EbaySettingsComponent implements OnInit, OnDestroy {
  eToken: object;
  policies: object;
  subscription: Subscription;

  constructor(
    private ebayService: EbayService
  ) { }

  ngOnInit() {
    this.subscription = this.ebayService.getPolicies()
      .subscribe((policies: object) => {
        this.policies = policies;
      },
      err => {
        console.log(err);
        return false;
      });
  }

  // Opt into Selling Policy Management (SPM)
  onOptInToSPM() {
    this.ebayService.optInToSPM()
      .subscribe(res => {
        console.log(res);
    },
    err => {
      console.log(err);
      return false;
    });
  }

  // Start of getting Opted In Programs for Ebay
  onGetOptInPrograms() {
    this.ebayService.getOptInPrograms()
      .subscribe(res => {
        console.log(res);
    },
    err => {
      console.log(err);
      return false;
    });
  }

  updateEbaySettings(form: NgForm) {
    const value = form.value;
    console.log('Update Ebay Settings Working:::Form Input= ' +value.placeholder)
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}

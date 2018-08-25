import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { EbayService } from '../../../ebay/ebay.service';

@Component({
  selector: 'app-ebay-active',
  templateUrl: './ebay-active.component.html',
  styleUrls: ['./ebay-active.component.css']
})
export class EbayActiveComponent implements OnInit {
  offers: object;

  constructor(
    private ebayService: EbayService
  ) { }

  ngOnInit() {
    this.ebayService.getOffers()
      .subscribe((offers) => {
        console.log(offers)
        this.offers = offers;
      },
      (err) => {
        console.log(err);
        return false;
      })
  }

  // Controls the search form in Active tab of eBay
  // Searchable by SKU, Title, UPC.
  onSearch(form: NgForm) {
    const value = form.value;
    console.log(value);
  }

  onEdit() {
    console.log('edit item button working');
  }

  onDelete() {
    if(confirm('Are you sure you want to delete this item?')) {
      console.log('delete item button working');
    }

  }

}

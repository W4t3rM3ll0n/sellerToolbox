import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { ToolboxService } from '../../toolbox.service';

@Component({
  selector: 'app-link-items',
  templateUrl: './link-items.component.html',
  styleUrls: ['./link-items.component.css']
})
export class LinkItemsComponent implements OnInit {
  sellerToolboxItems: object; // Change to the correct type later.
  wooItems: object; // Change to the correct type later.
  toolboxOrderRow: NodeListOf<Element> | Array<HTMLTableElement> = document.getElementsByClassName('toolboxOrders');
  marketplaceOrderRow: NodeListOf<Element> | Array<HTMLTableElement> = document.getElementsByClassName('marketplaceOrders');
  selectedToolboxItem: Array<object> = [];
  previousToolboxRow: number;
  selectedMarketplaceItem: Array<object> = [];
  previousMarketplaceRow: number;

  constructor(
    private toolboxService: ToolboxService
  ) { }

  ngOnInit() {
    this.toolboxService.getProducts()
      .subscribe((products) => {
        this.sellerToolboxItems = products;
        // console.log(this.sellerToolboxItems);
      },
      err => {
        console.log(err);
      });
  }

/*   // Search Toolbox // Implement Dual Search Later
  onSearchToolboxItem(form: NgForm) {
    console.log(form.value);
  }

  // Search Marketplace
  onSearchMarketplaceItem(form: NgForm) {
    console.log(form.value);
  } */

  onSearchItems(form: NgForm) {
    console.log(form.value);
  }

  // Select Toolbox Items
  onSelectToolboxItem(i: number) {
    // console.log(`Select Toolbox Item: ${i}`);

    // Check if this.selectedToolboxItem is empty
    if(this.selectedToolboxItem.length === 0) {
      // Save the row index to unhighlight on next click
      this.previousToolboxRow = i;
      // Push the item into the array
      this.selectedToolboxItem.push(this.sellerToolboxItems[i]);

      // console.log(this.selectedToolboxItem);
      // Set the background color of the element row
      this.toolboxOrderRow[i].setAttribute('style', 'background-color: rgba(255, 255, 255, 0.3);');
      this.toolboxOrderRow[i]['selected'] = 'yes';
      // Get Woo Marketplace Items
      this.toolboxService.getAllWooProducts()
      .subscribe((products) => {
        this.wooItems = products;
        // console.log(this.wooItems);
      },
      err => {
        console.log(err);
      });
    } else {
      // If this.selectedToolboxItem is not empty set it to empty
      this.selectedToolboxItem = [];
      this.selectedMarketplaceItem = [];
      // Unhighlight the previous row that was selected
      this.toolboxOrderRow[this.previousToolboxRow].setAttribute('style', '');
      this.toolboxOrderRow[this.previousToolboxRow]['selected'] = 'no';
      // Call this method again with the new index
      this.onSelectToolboxItem(i);
    }

  }

  // Select Marketplace Items
  onSelectMarketplaceItem(i: number) {
    // console.log(`Select Marketplace Item: ${i}`);

    if(this.selectedMarketplaceItem.length === 0) {
      this.previousMarketplaceRow = i;
      this.selectedMarketplaceItem.push(this.wooItems[i]);

      // console.log(this.selectedMarketplaceItem);
      // Set the background color of the element row
      this.marketplaceOrderRow[i].setAttribute('style', 'background-color: rgba(255, 255, 255, 0.3);');
      this.marketplaceOrderRow[i]['selected'] = 'yes';
    } else {
      this.selectedMarketplaceItem = [];
      this.marketplaceOrderRow[this.previousMarketplaceRow].setAttribute('style', '');
      this.marketplaceOrderRow[this.previousMarketplaceRow]['selected'] = 'no';
      this.onSelectMarketplaceItem(i);
    }

  }

  // Link items
  onLinkItems() {
    if(this.selectedToolboxItem.length === 1 && this.selectedMarketplaceItem.length === 1) {
      // this.selectedToolboxItem && this.selectedMarketplaceItem
      const items = {
        toolboxItem: this.selectedToolboxItem,
        marketplaceItem: this.selectedMarketplaceItem
      }
      this.toolboxService.linkItems(items)
        .subscribe((linked) => {
          console.log(linked);
        },
        err => {
          console.error(err);
        })
    } else {
      console.error('Items are not selected properly.');
      return false;
    }
  }

  // Filter By SKU Column
  filterBySku() {
    console.log('Filter by sku working');
  }

  // Filter By Title Column
  filterByTitle() {
    console.log('Filter by title working');
  }

}

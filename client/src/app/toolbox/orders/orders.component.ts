import { Component, OnInit } from '@angular/core';
import { NgForm, FormArray } from '@angular/forms';

import { ToolboxService } from '../toolbox.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  editModeOff: boolean = true;
  wooOrders: object[]; // This property will be removed when orders is properly implemented through the database.
  orders: {orders: object[]}; 
  selectedOrders: object[] = [];
  tag: NodeListOf<Element> | Array<HTMLTableElement> = document.getElementsByTagName('tr');
  orderFilter: string = 'processing';
  isOpen = false;

  constructor(
  private toolboxService: ToolboxService
  ) { }

  ngOnInit() {
  this.resetToDefault();
  this.toolboxService.getOrdersByStatus(this.orderFilter)
    .subscribe((orders) => {
      this.orders = orders;
    });
  }

  onSearchOrders(form: NgForm) {
    console.log(form.value);
  }
  
  onSelectItem(i: number) {
    // If row is selected, highlight the row.
    // Add one to the index in order for it to highlight the currently selected row.
    if(this.tag[i + 1]['selected'] === 'yes') {
      this.tag[i + 1].setAttribute('style', '');
      this.tag[i + 1]['selected'] = 'no';
      // Find the index of where the order rows lives inside this.selectedOrders []
      const index = this.selectedOrders.indexOf(this.orders.orders[i]);
      this.selectedOrders.splice(index, 1);
    } else {
      this.tag[i + 1].setAttribute('style', 'background-color: rgba(255, 255, 255, 0.3);');
      this.tag[i + 1]['selected'] = 'yes';
      this.selectedOrders.push(this.orders.orders[i]);
    }
  }
  
  onEditOrders() {
    this.editModeOff = !this.editModeOff;
  }

  onDeleteSingleOrder(i: number) {
    const dblCheck = confirm('Are you sure you want to delete this order?');

    if(dblCheck) {
      this.toolboxService.deleteSingleOrder(this.orders.orders[i]['_id'])
      .subscribe((deleted) => {
        // console.log(deleted);
        return false;
      },
      err => console.log(err));

      // Reach out to Woo API and trash the order.
      this.toolboxService.updateWooOrders([], { delete: [this.orders.orders[i]['marketplaceID']] })
      .subscribe((deleted) => {
        console.log(deleted);
        // Splice the item in the array at its index once.
        this.orders.orders.splice(i, 1);
      },
      err => console.log(err));
    } else {
      return false;
    }
  }

  onDeleteMultiOrders() {
    // console.log(this.selectedOrders);
    this.toolboxService.deleteOrders(this.selectedOrders)
      .subscribe((deleted) => {
        // console.log(deleted);
        return false;
      },
      err => console.log(err));

    this.toolboxService.updateWooOrders(this.selectedOrders, { delete: [] })
      .subscribe((deleted) => {
        console.log(deleted);
      },
      err => console.log(err));
    
    // Increment backwards to remove the selected rows
    for(let i = this.orders.orders.length - 1; i >= 0; i--) {
      for(let j = this.selectedOrders.length - 1; j >= 0; j--) {
        if(this.orders.orders[i] === this.selectedOrders[j]) {
          const index = this.orders.orders.indexOf(this.selectedOrders[j]);
          // console.log(index);
          this.orders.orders.splice(index, 1);
        }
      }
    }
  }

  onSelectOrderFilter(e?) {
    this.resetToDefault();
    this.orderFilter = e.target.value;
    if(this.orderFilter === 'all') {
      this.toolboxService.getAllOrders()
      .subscribe((orders) => {
        console.log(orders);
        this.orders = orders;
      });
    } else {
      this.toolboxService.getOrdersByStatus(this.orderFilter)
      .subscribe((orders) => {
        console.log(orders);
        this.orders = orders;
      });
    }
  }

  onPrintOrders() {
    const dblCheck = confirm('Are you sure you want to print and mark order\'s as completed?');

    if(dblCheck) {
      // Send selectedOrders to server
      this.toolboxService.printOrders(this.selectedOrders)
        .subscribe(res => {
          /* 
          * Trying to send PDF to client 
          * `pdf` is the pdf file in Buffer form
          */
          // let blobb = new Blob([pdf], {type: 'application/pdf'});
          // let url: any = URL.createObjectURL(blobb);
          // window.open(url);
          // console.log(url);
          // console.log(blobb);
          console.log(res);
          this.ngOnInit();
        });
    } else {
      return false;
    }
  }

  openDropdown() {
    this.isOpen = !this.isOpen;

    if(this.isOpen === true) {
      document.getElementById('dropdownToggle').className += ' show';
    } else {
      document.getElementById('dropdownToggle').className = 'dropdown-menu';
    }
  }

  onUpdateOrders(options?: string) {
    if(this.selectedOrders.length > 0) {
      // Update the order in the database.
      this.toolboxService.updateOrders(this.selectedOrders, options)
      .subscribe((updated) => { 
        console.log(updated);
        // Update orders on woocommerce. Change later to be dynamic for all marketplaces.
        this.toolboxService.updateWooOrders(this.selectedOrders, { update: [] }, options)
        .subscribe((updated) => {
          // console.log(updated);
          this.ngOnInit();
        });
      });
    }
  }

  resetToDefault() {
    this.editModeOff = true;
    this.selectedOrders = [];
    for(let i = 0; i < this.tag.length; i++) {
      this.tag[i].setAttribute('style', '');
      this.tag[i]['selected'] = 'no';
    }
  }

  onSaveOrders() {
    this.toolboxService.saveOrders()
      .subscribe((saved) => {
        console.log(saved);
      },
      err => console.log(err));
  }

}

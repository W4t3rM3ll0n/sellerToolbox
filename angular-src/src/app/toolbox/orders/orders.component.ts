import { Component, OnInit } from '@angular/core';
import { NgForm, FormArray } from '@angular/forms';

import { ToolboxService } from '../toolbox.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  editModeOff: boolean = true;
  wooOrders: object[];
  selectedOrders: object[] = [];
  tag: NodeListOf<Element> | Array<HTMLTableElement> = document.getElementsByTagName('tr');
  orderFilter: string = 'processing';
  isOpen = false;

  constructor(
    private toolBox: ToolboxService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.toolBox.getWooOrdersByStatus(this.orderFilter)
      .subscribe((orders) => {
        this.wooOrders = orders;
        console.log(this.wooOrders);
      },
      err => {
        console.log(err);
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
      const index = this.selectedOrders.indexOf(this.wooOrders[i]);
      this.selectedOrders.splice(index, 1);
    } else {
      this.tag[i + 1].setAttribute('style', 'background-color: rgba(255, 255, 255, 0.3);');
      this.tag[i + 1]['selected'] = 'yes';
      this.selectedOrders.push(this.wooOrders[i]);
    }

    // console.log(this.selectedOrders);
  }
  
  onEditOrders() {
    this.editModeOff = !this.editModeOff;
  }

  onDeleteSingleItems(i: number) {
    const dblCheck = confirm('Are you sure you want to delete this order?');

    if(dblCheck) {
      // Reach out to Woo API and trash the order.
      this.toolBox.updateWooOrders([], { delete: [this.wooOrders[i]['id']] })
        .subscribe((deleted) => {
          console.log(deleted);
          // Splice the item in the array at its index once.
          this.wooOrders.splice(i, 1);
        },
        err => {
          console.log(err);
        });
    } else {
      return false;
    }
  }

  onDeleteMultiOrders() {
    // console.log(this.selectedOrders);
    this.toolBox.updateWooOrders(this.selectedOrders, { delete: [] })
      .subscribe((deleted) => {
        console.log(deleted);
      },
      err => {
        console.log(err);
      });
    
    // Increment backwards to remove the selected rows
    for(let i = this.wooOrders.length - 1; i >= 0; i--) {
      for(let j = this.selectedOrders.length - 1; j >= 0; j--) {
        if(this.wooOrders[i] === this.selectedOrders[j]) {
          const index = this.wooOrders.indexOf(this.selectedOrders[j]);
          // console.log(index);
          this.wooOrders.splice(index, 1);
        }
      }
    }
  }

  onSelectOrderFilter(e?) {
    this.resetToDefault();
    this.orderFilter = e.target.value;
    if(this.orderFilter === 'all') {
      this.toolBox.getAllWooOrders()
        .subscribe((orders) => {
          this.wooOrders = orders;
        },
        err => {
          console.log(err);
        });
    } else {
      this.toolBox.getWooOrdersByStatus(this.orderFilter)
      .subscribe((orders) => {
        this.wooOrders = orders;
      },
      err => {
        console.log(err);
      });
    }
  }

  onPrintOrder() {
    // console.log(this.selectedOrders);
    this.selectedOrders.forEach((order) => {
      console.log(order);
    });
  }

  openDropdown() {
    this.isOpen = !this.isOpen;

    if(this.isOpen === true) {
      document.getElementById('dropdownToggle').className += ' show';
    } else {
      document.getElementById('dropdownToggle').className = 'dropdown-menu';
    }
  }

  onUpdateWooOrders(options?) {
    if(this.selectedOrders.length > 0) {
      this.toolBox.updateWooOrders(this.selectedOrders, { update: [] }, options)
        .subscribe((updated) => {
          console.log(updated);
        },
        err => {
          console.log(err);
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

}

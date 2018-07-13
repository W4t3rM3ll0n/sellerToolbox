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

  constructor(
    private toolBox: ToolboxService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.toolBox.getWooOrders()
      .subscribe((orders) => {
        this.wooOrders = orders;
        // console.log(this.wooOrders);
      },
      err => {
        console.log(err);
        return false;
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
    // Splice the item in the array at its index once.
    this.wooOrders.splice(i, 1);
    // Reach out to Woo API and trash the order.
  }

  onDeleteMultiOrders() {}

  onSelectOrderFilter(e) {
    console.log(e.target.value);
  }

  onPrintOrder() {
    // console.log(this.selectedOrders);
    this.selectedOrders.forEach((order) => {
      console.log(order);
    });
  }

}

import { Component, OnInit } from '@angular/core';
import { NgForm, FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';

import { ToolboxService } from '../toolbox.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  editModeOff: boolean = true;
  ordersForm: FormGroup;

  constructor(
    private toolBox: ToolboxService,
    private _fb: FormBuilder,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.ordersForm = this._fb.group({
      'orders': this._fb.array([
        this.initForm()
      ])
    });
  }

  initForm() {
    // Initialize a product row
    return this._fb.group({
      'orderNumber': ['', Validators.required],
      'productImage': ['', Validators.required],
      'orderItem': ['', Validators.required],
      'orderQty': ['', Validators.required],
      'orderTotal': ['', Validators.required]
    });
  }

  newOrderRow() {
    return this._fb.group({
      'orderNumber': ['', Validators.required],
      'productImage': ['', Validators.required],
      'orderItem': ['', Validators.required],
      'orderQty': ['', Validators.required],
      'orderTotal': ['', Validators.required]
    });
  }

  addNewOrderRow() {
    const control = <FormArray>this.ordersForm.controls['orders'];
    control.push(this.newOrderRow());
  }

  onSearchOrders(form: NgForm) {
    console.log(form.value);
  }

  onUpdateOrders() {}
  
  onSelectItem(i: number) {}
  
  onSubmitOrders() {
    const ordersForm = this.ordersForm.value.orders;
    console.log(ordersForm);
  }

  onDeleteSingleItems(i: number) {
    // Remove an order row
    const control = <FormArray>this.ordersForm.controls['orders'];
    control.removeAt(i);
  }
  
  onEditOrders() {
    this.editModeOff = !this.editModeOff;
  }

  onDeleteMultiOrders() {}

  onSelectOrderFilter(e) {
    console.log(e.target.value);
  }

}

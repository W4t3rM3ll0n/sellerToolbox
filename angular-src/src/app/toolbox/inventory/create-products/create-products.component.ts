import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormArray, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { ToolboxService } from '../../toolbox.service';

@Component({
  selector: 'app-create-products',
  templateUrl: './create-products.component.html',
  styleUrls: ['./create-products.component.css']
})
export class CreateProductsComponent implements OnInit {
  createProductsForm: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private toolboxService: ToolboxService,
    private router: Router
  ) { }

  ngOnInit() {
    // Initialize the form
    this.createProductsForm = this._fb.group({
      'products': this._fb.array([
        this.initProductRow()
      ])
    });
  }
  
  initProductRow() {
    // Initialize a product row
    return this._fb.group({
      'sku': ['', Validators.required],
      'title': ['', Validators.required],
      'quantity': this._fb.group({
        'quantity': [''],
        'availableQuantity': [''],
        'alertQuantity': [''],
        'pendingOrders': [0],
        'neededQuantity': [0],
      }),
      'description': [''],
      'price': this._fb.group({
        'purchasePrice': [''],
        'stockValue': [0],
      }),
      'category': [''],
      'variationGroup': [''],
      'upc': [''],
      'barcode': [''],
      'images': [''],
      'condition': [''],
      'location': [''],
      'detail': this._fb.group({
        'weight': [0],
        'height': [0],
        'width': [0],
        'depth': [0],
      }),
      'binLocation': [''],
      'monitor': [true],
      'createdDate': [Date()]
    });
  }

  // Create Products Button
  onCreateProducts() {
    // console.log(this.createProductsForm);
    const productsDetail = this.createProductsForm.value.products;

    this.toolboxService.createItems(productsDetail)
      .subscribe((res) => {
        console.log(res);
        this.router.navigate(['/toolbox/inventory']);
      },
      (err) => {
        console.log(err);
        return false;
      });
      
  }

  // Add Row Button
  addNewProductRow() {
    const control = <FormArray>this.createProductsForm.controls['products'];
    control.push(this.initProductRow());
  }

  removeProductRow(rowIndex: number) {
    // Remove a product row
    const control = <FormArray>this.createProductsForm.controls['products'];
    control.removeAt(rowIndex);
  }

  /*** Popup Modal Control ***/

  // Description Modal
  onDescriptionModalOpened(rowIndex: number, $event) { // We get the $event.modal from the modal component. The number is directly from this componenets html.
    $event.modal[rowIndex].setAttribute('style', 'visibility: visible;');

    /* for(let i = 0; i < $event.modal.length; i++) { // Old way of doing the above. If bugs revert back to this.
      // if i equals the row that is passed in from .html
      if(i === rowIndex) {
        $event.modal[i].setAttribute('style', 'visibility: visible;');
      }
    } */

  }

  onDescriptionModalClosed(rowIndex: number, $event) { // We get the $event.modal from the modal component. The number is directly from this componenets html.
    $event.modal[rowIndex].setAttribute('style', 'visibility: hidden;');

    /* for(let i = 0; i < $event.modal.length; i++) { // Old way of doing the above. If bugs revert back to this.
      // if i equals the row that is passed in from .html
      if(i === rowIndex) {
        $event.modal[i].setAttribute('style', 'visibility: hidden;')
      }
    } */

  }

}

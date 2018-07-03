import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm, FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';

import { ToolboxService } from '../toolbox.service';
import { ProductGroupRow, InventoryGroupRow } from '../../shared/general.models';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit, OnDestroy {
  editModeOff: boolean = true;
  updateProductsForm: FormGroup;
  inventory: Array<InventoryGroupRow>;
  selectedRows: Array<ProductGroupRow> = [];
  tag: NodeListOf<Element> | Array<HTMLTableElement> = document.getElementsByTagName('tr');

  constructor(
    private toolboxService: ToolboxService,
    private _fb: FormBuilder
  ) { }

  ngOnInit() {
    // Getting the products from the database.
    this.toolboxService.getProducts()
      .subscribe(
        (inventory) => {
          this.inventory = inventory;
          this.initForm();
        }
      )
  }

  initForm() {
    // Initialize the form.
    this.updateProductsForm = this._fb.group({
      // Array is empty in the beginning.
      'products': this._fb.array([])
    });
    const control = <FormArray>this.updateProductsForm.controls['products'];
    // Initialize product rows with the items/data from the database.
    this.inventory.forEach((item) => {
      // console.log(item);
      const data = this._fb.group({
        'id': [{value: item._id, disabled: true}],
        'images': [{value: item.images, disabled: true}],
        'sku': [{value: item.sku, disabled: true}],
        'title': [{value: item.title, disabled: true}],
        'quantity': this._fb.group({
          'quantity': [{value: item.quantity.quantity, disabled: true}],
          'availableQuantity': [{value: item.quantity.availableQuantity, disabled: true}],
          'alertQuantity': [{value: item.quantity.alertQuantity, disabled: true}],
          'pendingOrders': [{value: item.quantity.pendingOrders, disabled: true}],
          'neededQuantity': [{value: item.quantity.neededQuantity, disabled: true}]
        }),
        'description': [{value: item.description, disabled: true}],
        'price': this._fb.group({
          'purchasePrice': [{value: item.price.purchasePrice, disabled: true}],
          'stockValue': [{value: item.price.stockValue, disabled: true}],
        }),
        'category': [{value: item.category, disabled: true}],
        'variationGroup': [{value: item.variationGroup, disabled: true}],
        'upc': [{value: item.upc, disabled: true}],
        'barcode': [{value: item.barcode, disabled: true}],
        'condition': [{value: item.condition, disabled: true}],
        'location': [{value: item.location, disabled: true}],
        'detail': this._fb.group({
          'weight': [{value: item.detail.weight, disabled: true}],
          'height': [{value: item.detail.height, disabled: true}],
          'width': [{value: item.detail.width, disabled: true}],
          'depth': [{value: item.detail.depth, disabled: true}]
        }),
        'binLocation': [{value: item.binLocation, disabled: true}],
        'monitor': [{value: item.monitor, disabled: true}],
        'modifiedDate': [{value: item.modifiedDate, disabled: true}]
      });
      // Push to the empty array, above.
      control.push(data);
    });
  }
  
  onSearchInventory(form: NgForm) {
    if(this.editModeOff) {
      this.initForm();
      const value = form.value;
      const regex = new RegExp(value.search, 'i');
      
      // Get the search value, turn it into a string and then split each word seperated by spaces into an array.
      const filterWords: Array<string> = value.search.match(regex).join().split(/\s+/);
      const control = <FormArray>this.updateProductsForm.controls['products'];
  
      filterWords.forEach((word) => { // This loop marks each row by adding a 'keep' property to the rows that should be kept
        const searchWord = new RegExp(word, 'i');
  
        control.value.forEach((row) => {
  
          if(row.title.match(searchWord)) {
            // keepIndex = control.value.indexOf(row);
            row['keep'] = true;
          }
  
        });
      });
      
      control.value.forEach((row) => { // This loops searches each row and removes the row that doesn't have the 'keep' property.
        if(!row['keep']) {
          const index = control.value.indexOf(row);
          control.removeAt(index);
        }
      });
    }
  }

  onEditItems() {
    this.editModeOff = !this.editModeOff;
    // When edit mode is turned off resetToDefault().
    if(this.editModeOff) {
      this.resetToDefault();
    }
    // Controls enable/disable input.
    const control = this.updateProductsForm.controls['products'];
    control.disabled ? control.enable() : control.disable();
  }

  onUpdateItems() {
    // console.log(this.updateProductsForm);
    const productsDetail = this.updateProductsForm.value.products;
    
    this.toolboxService.updateItems(productsDetail)
      .subscribe(() => {
        this.editModeOff = !this.editModeOff;
        // Controls enable/disable input.
        const control = this.updateProductsForm.controls['products'];
        control.disabled ? control.enable() : control.disable();
      },
      (err) => {
        console.log(err);
        return false;
      });
  }

  onSelectItem(rowIndex: number) {
    
    // Only select if edit mode is on.
    if(this.editModeOff !== true) {
      const control = <FormArray>this.updateProductsForm.controls['products'];

      // If row is selected, highlight the row.
      // Add one to the index in order for it to highlight the currently selected row.
      if(this.tag[rowIndex + 1]['selected'] === 'yes') {
        this.tag[rowIndex + 1].setAttribute('style', '');
        this.tag[rowIndex + 1]['selected'] = 'no';
      } else {
        this.tag[rowIndex + 1].setAttribute('style', 'background-color: rgba(255, 255, 255, 0.3);');
        this.tag[rowIndex + 1]['selected'] = 'yes';
      }

      // Select the product row by selecting the controls row index.
      this.selectedRows.push(control.controls[rowIndex]);

    }

  }

  onDeleteSingleItems(rowIndex: number) {
    // Remove a product row
    const control = <FormArray>this.updateProductsForm.controls['products'];
    const item = control.value[rowIndex].id;

    const dblCheck = confirm('Are you sure you want to delete this item?');
    if(dblCheck) {
      // Remove from the client.
      control.removeAt(rowIndex);
      // Call toolbox service to delete item from the database.
      this.toolboxService.deleteItems(item)
        .subscribe((deleted) => {
          console.log(deleted);
        }, (err) => {
          console.log(err);
          return false;
        });
    } else {
      return false;

    }
  }

  onDeleteMultiItems() {
    if(!this.editModeOff) {
      // Collect the ids of each row that are selected
      const rowIds = []
      // Get the array of values (all the products rows in one array). Compare the [selectedRows] with all the values in the array and remove if value[i].id matches.
      const control = <FormArray>this.updateProductsForm.controls['products'];

      this.selectedRows.forEach((item) => { // Gets back selected row item.
        control.value.forEach((row) => { // Gets each row in the entire array of rows.

          // Check to see if the selected row item matches the row from the entire array of rows.
          if(item.value.id === row.id) {
            // Get the index of the matching id rows that were selected.
            const index = control.value.indexOf(row);
            rowIds.push(row.id);

            /* const dblCheck = confirm('Are you sure you want to delete these items?'); // Currenty prompts for each item.
            dblCheck === true ? control.removeAt(index) : null; */

            control.removeAt(index);
          }

        });
      });
      
      // Call toolbox service to delete item from the database.
      this.toolboxService.deleteItems(rowIds)
        .subscribe((deleted) => {
          console.log(deleted);
          this.editModeOff = true;
        }, (err) => {
          console.log(err);
          return false;
        });
    }
  }

  resetToDefault(rowIndex?: number) {
    this.editModeOff = true;
    this.selectedRows = [];
    for(let i = 0; i < this.tag.length; i++) {
      this.tag[i].setAttribute('style', '');
      this.tag[i]['selected'] = 'no';
    }
  }

  ngOnDestroy() {
    // console.log('destroyed');
    this.resetToDefault();
  }

}

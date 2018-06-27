import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormArray, FormBuilder } from '@angular/forms';

import { EbayService } from '../../../ebay/ebay.service';

@Component({
  selector: 'app-ebay-create-products',
  templateUrl: './ebay-create-products.component.html',
  styleUrls: ['./ebay-create-products.component.css']
})
export class EbayCreateProductsComponent implements OnInit {
  createProductsForm: FormGroup;
  private products: any; // Change the type to an object that correlates with the eBay product inventory structure.

  constructor(
    private _fb: FormBuilder,
    private ebayService: EbayService
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
      'description': [''],
      'aspects': [''],
      'upc': [''],
      'images': [''],
      'condition': [''],
    });
  }

  // Create Products Button
  onCreateProducts() {
    console.log(this.createProductsForm);
    const productFromForm = this.createProductsForm.value.products[0]; // Use only first index for testing purposes.

    const sku = productFromForm.sku;
    this.products = {
      "availability": {
        "shipToLocationAvailability": {
            "quantity": 50
        }
      },
      "condition": "NEW",
      "product": { 
          "title": "GoPro Hero4 Helmet Cam",
          "description": "New GoPro Hero4 Helmet Cam. Unopened box.",
            "aspects":{
              "Brand" :["GoPro"]
            },
            "brand":"GoPro",
            "mpn":"CHDHX-401",
          "imageUrls": [
              "http://i.ebayimg.com/images/i/182196556219-0-1/s-l1000.jpg",
              "http://i.ebayimg.com/images/i/182196556219-0-1/s-l1001.jpg",
              "http://i.ebayimg.com/images/i/182196556219-0-1/s-l1002.jpg"
          ]
      }
      // product: {
      //   title: productFromForm.title,
      //   aspects: {
      //     Brand: [productFromForm.aspects]
      //   },
      //   description: productFromForm.description,
      //   upc: [productFromForm.upc],
      //   imageUrls: [productFromForm.images]

      // },
      // condition: productFromForm.condition,
      // packageWeightAndSize: {
      //   dimensions: {
      //     height: 5,
      //     length: 10,
      //     width: 15,
      //     unit: 'INCH'
      //   },
      //   packageType: 'MAILING_BOX',
      //   weight: {
      //     value: 2,
      //     unit: 'POUND'
      //   }
      // },
      // availability: {
      //   shipToLocationAvailability: {
      //     quantity: 10
      //   }
      // }
    }
    const products = this.products;

    this.ebayService.createOrReplaceInventory(products, sku)
      .subscribe((test) => {
        console.log(test);
      },
      (err) => {
        console.log(err);
        return false;
      })

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

  // Popup Modal Control

  // Description Modal
  onDescriptionModalOpened(rowIndex: number, $event) { // We get the $event.modal from the modal component. The number is directly from this componenets html.
    for(let i = 0; i < $event.modal.length; i++) {
      // if i equals the row that is passed in from .html
      if(i === rowIndex) {
        $event.modal[i].setAttribute('style', 'visibility: visible;')

      }
    }
  }

  onDescriptionModalClosed(rowIndex: number, $event) { // We get the $event.modal from the modal component. The number is directly from this componenets html.
    for(let i = 0; i < $event.modal.length; i++) {
      // if i equals the row that is passed in from .html
      if(i === rowIndex) {
        $event.modal[i].setAttribute('style', 'visibility: hidden;')

      }
    }
  }
  
}

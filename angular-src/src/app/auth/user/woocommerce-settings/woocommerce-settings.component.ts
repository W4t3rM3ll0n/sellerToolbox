import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-woocommerce-settings',
  templateUrl: './woocommerce-settings.component.html',
  styleUrls: ['./woocommerce-settings.component.css']
})
export class WoocommerceSettingsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  onGetWooKeys() {
    window.location.replace('https://localhost:3000/woocommerce/getKeys');
  }

}

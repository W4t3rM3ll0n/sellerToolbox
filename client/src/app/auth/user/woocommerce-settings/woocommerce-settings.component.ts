import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-woocommerce-settings',
  templateUrl: './woocommerce-settings.component.html',
  styleUrls: ['./woocommerce-settings.component.css']
})
export class WoocommerceSettingsComponent implements OnInit {

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit() {
  }

  onGetWooKeys() {
    window.location.replace('https://localhost:3000/woocommerce/getKeys');
  }


  onUpdateWooAPIKeys(form: NgForm) {
    // Form value's
    const value = form.value;
    // Pass the form value to authService
    this.authService.updateWooKeys(value)
      .subscribe((res) => {
        console.log(res);
      });
  }

}

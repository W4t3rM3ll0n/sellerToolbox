import { Component, OnInit } from '@angular/core';
import { NgForm, FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../auth/auth.service';
import { AddressModel } from '../../../shared/general.models';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: object; // Change the type later.
  addUpdateAddressForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private _fb: FormBuilder
  ) { }

  ngOnInit() {
    this.authService.getProfile()
      .subscribe(profile => {
        this.user = profile;
        // console.log(this.user);
        return this.user;
      },
      err => {
        console.log(err);
        return false;
      });
    this.initAddressForm();
  }
  
  onUpdateUser(form: NgForm) {
    const value = form.value;
    const updateUser = {
      name: value.name,
      username: value.username,
      email: value.email
    }

    this.authService.updateUser(updateUser)
      .subscribe(
        res => {
          console.log(res);
        }
      );
  }

  initAddressForm() {
    // Initialize the form.
    this.addUpdateAddressForm = this._fb.group({
      // Array is empty in the beginning.
      'addresses': this._fb.array([])
    });
    this.addressForms();
  }

  blankFormRow() {
    const data = this._fb.group({
      'id': [''],
      'fullAddress': [''],
      'name': [''],
      'address1': ['', Validators.required],
      'address2': ['', Validators.required],
      'city': ['', Validators.required],
      'state': ['', Validators.required],
      'zip': ['', Validators.required],
      'primary': [false]
    });
    return data;
  }

  addressForms() {
    const control = <FormArray>this.addUpdateAddressForm.controls['addresses'];
    this.authService.getProfile()
      .subscribe(profile => {
        if(profile.addresses.length === 0) {
          const data = this.blankFormRow();
          return control.push(data);
        } else {
          profile.addresses.forEach((address) => {
            const dataValues: any = { // Change this type later.
              'id': [address._id],
              'fullAddress': [address.fullAddress],
              'company': [address.company],
              'name': [address.name],
              'address1': [address.address1],
              'address2': [address.address2],
              'city': [address.city],
              'state': [address.state],
              'zip': [address.zip],
              'country': [address.country],
              'primary': [address.primary]
            }

            const data = this._fb.group(dataValues);
            control.push(data);
          });
        }
      },
      err => {
        console.log(err);
        return false;
      });
  }

  onAddAddress() {
    const control = <FormArray>this.addUpdateAddressForm.controls['addresses'];
    // console.log(control)
    if(control.length < 5) {
      const data = this.blankFormRow();
      // console.log(data);
      return control.push(data);
    };
  }

  onAddUpdateAddress() { // This method still has bugs 07/02/18. Use the work around for now.
    const address = this.addUpdateAddressForm.value.addresses;
    // console.log(address);
    const radios = document.getElementsByClassName('radios');
    for(let i = 0; i < radios.length; i++) {
      radios[i]['checked'] ? address[i].primary = true : address[i].primary = false;
    }

    // console.log(address);

    this.authService.addUpdateAddress(address)
      .subscribe((res) => {
        // console.log(res);
        this.ngOnInit();
      });

  }

  removeAddressRow(rowIndex: number) {
    // Remove a product row
    const control = <FormArray>this.addUpdateAddressForm.controls['addresses'];
    const addressId = control.value[rowIndex].id;

    if(addressId !== '') {
      const dblCheck = confirm('Are you sure you want to delete this address?');
      if(dblCheck) {
        this.authService.deleteAddress(addressId)
        .subscribe((res) => {
          control.removeAt(rowIndex);
          console.log(res);
        },
        (err) => {
          console.log(err);
          return false;
        });
      } else {
        return false;
      }
    } else {
      control.removeAt(rowIndex);
    }

  }

  onUpdatePassword(form: NgForm) {
    const value = form.value
    const updateUser = {
      password: value.password,
      newPassword: value.newPassword,
    }
    this.authService.updatePassword(updateUser)
      .subscribe(
        (res) => {
          console.log(res);
        },
        (err) => {
          console.log(err);
          return false;
        }
      )
  }

  onDeleteUser() {
    if(confirm('Are you sure you want to delete your account?')) {
      this.authService.deleteUser()
        .subscribe(
          (res) => {
            console.log(JSON.stringify(res));
            this.authService.logout();
            console.log('You are now logged out');
            this.router.navigate(['/login']);
          },
          (err) => {
            console.log(err);
            return false;
          }
        )
    }
  }

  onAuthPitneyBowes() {
    this.authService.getPitneyBowesAuth()
      .subscribe((success) => {
        console.log(success);
      })
  }

}

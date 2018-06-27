import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: Object; // This may not be needed anymore.

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.getProfile()
      .subscribe(profile => {
        this.user = profile;
      },
      err => {
        console.log(err);
        return false;
      });
  }

  onUpdateUser(form: NgForm) {
    const value = form.value
    const updateUser = {
      name: value.name,
      username: value.username,
      email: value.email,
    }
    this.authService.updateUser(updateUser)
      .subscribe(
        res => {
          console.log(res);
        }
      );
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

}

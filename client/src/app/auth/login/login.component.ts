import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username: String;
  password: String;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  onLogIn(form: NgForm) {
    const value = form.value;
    const user = {
      username: value.username,
      password: value.password
    }

    this.authService.authenticateUser(user)
      .subscribe(data => {
        if(data.success) {
          this.authService.storeUserData(data.token, data.user);
          console.log('You are now logged in');
          this.router.navigate(['/']); // make this go to dashboard later
        } else {
          console.log(data.msg)
          this.router.navigate(['/login']);
        }
      });
  }

}

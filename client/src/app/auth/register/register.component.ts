import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  name: String;
  username: String;
  email: String;
  password: String;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  // Register a user
  onRegister(form: NgForm) {
    const value = form.value
    const user = {
      name: value.name,
      email: value.email,
      username: value.username,
      password: value.password
    }

    this.authService.registerUser(user)
      .subscribe(data => {
        if(data.success) {
          console.log('User has been registered')
          this.router.navigate(['/login']);

        } else {
          console.log('Something went wrong')
          this.router.navigate(['/register']);

        }
    });
  }

}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  onLogout() {
    this.authService.logout();
    console.log('You are now logged out');
    this.router.navigate(['/login']);
  }

  openDropdown() {
    this.isOpen = !this.isOpen;

    if(this.isOpen === true) {
      document.getElementById('navbarColor02').className += ' show';
    } else {
      document.getElementById('navbarColor02').className = 'collapse navbar-collapse';
    }
  }

}

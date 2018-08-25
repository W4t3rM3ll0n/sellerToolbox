import { Router, CanActivate } from '@angular/router';
import { Injectable } from '@angular/core';

import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
      private authService: AuthService,
      private router: Router
    ) {}

  canActivate() {
      if(this.authService.isAuthenticated()) {
          return true;
      } else {
        this.router.navigate(['/login']);
        return false;
      }
  }
}

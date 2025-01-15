import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const userRole = localStorage.getItem('userRole');
      const requiredRole = route.data['role'];

      if (!userRole) {
        this.router.navigate(['/login']);
        return false;
      }

      // Map 'user' route role to 'department' database role
      if (requiredRole === 'user' && userRole === 'department staff') {
        return true;
      }

      // Direct match for other roles (admin, gso, bac)
      if (userRole === requiredRole) {
        return true;
      }

      // If the role does not match, redirect to unauthorized page or login
      this.router.navigate(['/login']);
      return false;
    }

    return false;
  }
}

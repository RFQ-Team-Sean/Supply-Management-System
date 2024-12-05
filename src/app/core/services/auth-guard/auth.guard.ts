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
        this.router.navigate(['/login']); // Redirect to login if not logged in
        return false;
      }

      // Check if the user has the required role
      if (requiredRole && (userRole === requiredRole || requiredRole === 'user')) {
        return true;
      }

      // If the role does not match, redirect to unauthorized page or login
      this.router.navigate(['/unauthorized']);
      return false;
    }

    // If not in browser, deny access
    return false;
  }
}

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { SupabaseService } from '../supabase.service';
import { Observable, map, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.supabaseService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/auth/login']);
          return false;
        }

        const requiredRole = route.data['role'];
        if (!requiredRole) {
          return true;
        }

        if (user.role.toLowerCase() !== requiredRole.toLowerCase()) {
          // Redirect to the appropriate dashboard based on user's role
          const roleRoutes: { [key: string]: string } = {
            'admin': '/admin/dashboard',
            'gso': '/gso/dashboard',
            'department': '/department/dashboard',
            'property_management': '/property/dashboard',
            'bac': '/bac/dashboard'
          };

          const redirectRoute = roleRoutes[user.role.toLowerCase()];
          if (redirectRoute) {
            this.router.navigate([redirectRoute]);
          } else {
            this.router.navigate(['/auth/login']);
          }
          return false;
        }

        return true;
      })
    );
  }
}
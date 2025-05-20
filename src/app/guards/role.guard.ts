import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router'; // to handle redirection if needed
import { User, UserService } from '../services/user.service';


export const roleGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  const user: User | undefined = userService.getUser(); // get the current user from the user service
  const requiredRoles = route.data['roles'] as string[]; // get the roles required from the route data

  if (!user) {
    router.navigate(['/login']); // redirect to login if the user is not authenticated
    return false;
  }

  const hasRequiredRole = requiredRoles.includes(user?.role) // check if user has one of the required roles
  if (!hasRequiredRole) {
    router.navigate(['/']); // redirect to an access-denied page if the user doesn't have the required role
    return false;
  }

  return true; // allow access if the user has the required role
};

import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { inject } from '@angular/core';

export const dashboardGuard: CanActivateFn = (route, state) => {
  const userService =  inject(UserService); // Inject the user service
  const router = inject(Router); // Inject the router to navigate

  const user = userService.getUser();  // Get the user information from the service

  if (user === undefined) {
    // If user is undefined, redirect to login page
    router.navigate(['/authentication/login']);
    return false;
  } else {
    // If user is defined, allow access to the route
    return true;
  }
};

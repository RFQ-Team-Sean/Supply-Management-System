import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = async (route, state) => {
  const userService =  inject(UserService); // Inject the user service
  const router = inject(Router); // Inject the router to navigate
  await userService.setUserData();
  const user = userService.getUser();  // Get the user information from the service

  if (user) {
    // If user is undefined, redirect to login page
    router.navigate(['/dashboard']);
    return false;
  } else {
    // If user is defined, allow access to the route
    return true;
  }
};

import { CanActivateFn } from '@angular/router';

export const auhtGuardGuard: CanActivateFn = (route, state) => {
  return true;
};

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() {}

    // Toggle dark mode
    toggleDarkMode() {
      const darkMode = this.isDarkModeEnabled();
      if (darkMode) {
        this.disableDarkMode();
      } else {
        this.enableDarkMode();
      }
    }
  
    // Enable dark mode
    enableDarkMode() {
      document.querySelector('html')?.classList.add('dark');
      document.querySelector('html')?.classList.add('dark-theme');
      document.querySelector('html')?.classList.remove('light-theme');
      localStorage.setItem('dark', 'true');
    }
    
    // Disable dark mode
    disableDarkMode() {
      document.querySelector('html')?.classList.remove('dark');
      document.querySelector('html')?.classList.remove('dark-theme');
      document.querySelector('html')?.classList.add('light-theme');
      localStorage.setItem('dark', 'false');
    }
  
    // Check if dark mode is enabled
    isDarkModeEnabled(): boolean {
      return document.querySelector('html')?.classList.contains('dark') ?? false;
    }
    
}

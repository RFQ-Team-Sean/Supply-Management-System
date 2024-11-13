// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Route, withComponentInputBinding } from '@angular/router';
import { AppComponent } from './app/app.component';

// feature imports go here
import { AMainPageComponent } from './features/a-main-page/a-main-page.component';
import { LoginComponent } from './features/login/login.component';
import { SignupComponent } from './features/signup/signup.component';
import { SupabaseService } from './app/services/supabase.service';



// define the routes here
const routes: Route[] = [
  { path: '', component: LoginComponent },
  { path: 'main', component: AMainPageComponent },
  { path: 'signup', component: SignupComponent },
  // Add other routes here as needed
];

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes, withComponentInputBinding()), SupabaseService],
}).catch(err => console.error(err));

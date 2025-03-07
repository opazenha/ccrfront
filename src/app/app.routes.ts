import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { PrayerRequestComponent } from './components/prayer-request/prayer-request.component';
import { NewsletterComponent } from './components/newsletter/newsletter.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'prayer-request', component: PrayerRequestComponent },
  { path: 'newsletter', component: NewsletterComponent },
  // { path: '**', redirectTo: '/' } // Wildcard route for a 404 page
];

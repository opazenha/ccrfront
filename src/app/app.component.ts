import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EventsListComponent } from './components/events-list/events-list.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { NewsletterComponent } from "./components/newsletter/newsletter.component";
import { PrayerRequestComponent } from './components/prayer-request/prayer-request.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, PrayerRequestComponent, EventsListComponent, FooterComponent, NewsletterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'Sistema CCR Braga';
}

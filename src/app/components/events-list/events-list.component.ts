import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

interface Event {
  id: number;
  name: string;
  description: string;
  date: string | Date;
  time: string | Date;
  duration: number; //Time duration represented in minutes
  departament: string;
  status: string;
  reminder: string;
  notes: string;
  weekDay?: string;
  image: string;
  formattedDate?: string; // Added formatted date field
}

@Component({
  selector: 'app-events-list',
  imports: [CommonModule],
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.css']
})
export class EventsListComponent implements OnInit {
  events: Event[] = [];
  allEvents: Event[] = [];
  currentEndDate: Date = new Date();
  displayDays: number = 30;
  additionalDays: number = 7;
  
  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    // Set the current end date to 30 days from now
    this.currentEndDate = new Date();
    this.currentEndDate.setDate(this.currentEndDate.getDate() + this.displayDays);
    
    this.loadEvents();
  }

  loadEvents(): void {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('daniel:daniel')
      })
    };

    this.http.get<Event[]>('http://localhost:7771/api/v1/events/', httpOptions).subscribe(events => {
      this.allEvents = events.map(event => {
        try {
          // Parse date string - expected format: "YYYY-MM-DD"
          let dateObj: Date;
          if (typeof event.date === 'string') {
            // Use a more reliable approach to parse the date string
            const dateParts = event.date.split('-');
            if (dateParts.length === 3) {
              const year = parseInt(dateParts[0], 10);
              const month = parseInt(dateParts[1], 10) - 1; // JS months are 0-indexed
              const day = parseInt(dateParts[2], 10);
              dateObj = new Date(year, month, day);
            } else {
              throw new Error('Invalid date format');
            }
          } else {
            dateObj = new Date(event.date);
          }
          
          // Parse time string - expected format: "HH:MM:SS"
          let hours = 0;
          let minutes = 0;
          if (typeof event.time === 'string') {
            const timeParts = event.time.split(':');
            if (timeParts.length >= 2) {
              hours = parseInt(timeParts[0], 10);
              minutes = parseInt(timeParts[1], 10);
            } else {
              throw new Error('Invalid time format');
            }
          } else {
            const timeObj = new Date(event.time);
            if (!isNaN(timeObj.getTime())) {
              hours = timeObj.getHours();
              minutes = timeObj.getMinutes();
            } else {
              throw new Error('Invalid time value');
            }
          }
          
          // Create a combined date and time object
          const combinedDateTime = new Date(
            dateObj.getFullYear(),
            dateObj.getMonth(),
            dateObj.getDate(),
            hours,
            minutes
          );
          
          // Validate the combined date
          if (isNaN(combinedDateTime.getTime())) {
            throw new Error('Invalid combined date/time');
          }
          
          // Get the day of the week as a string (e.g., "Monday")
          const weekDay = combinedDateTime.toLocaleDateString('pt-PT', { weekday: 'long' }).toUpperCase();
          
          // Format the date in Portuguese
          const formattedDate = this.formatDateInPortuguese(dateObj);

          return {
            ...event,
            date: dateObj,
            time: combinedDateTime,
            weekDay: weekDay,
            formattedDate: formattedDate,
            image: event.image || `/public/event${event.id}.jpg` // Use existing image or default path
          };
        } catch (error) {
          console.error('Error parsing date/time for event:', event, error);
          const now = new Date();
          const formattedDate = this.formatDateInPortuguese(now);
          return {
            ...event,
            date: now,
            time: now,
            weekDay: now.toLocaleDateString('pt-PT', { weekday: 'long' }).toUpperCase(),
            formattedDate: formattedDate,
            image: event.image || '/public/noimage.jpg' // Use fallback image for events with errors
          };
        }
      });
      
      // Filter events for the next default amount of days
      this.filterEventsForDisplay();
      console.log('Loaded events:', this.events);
    }, error => {
      console.error('Error loading events:', error);
    });
  }

  filterEventsForDisplay(): void {
    const now = new Date();
    
    this.events = this.allEvents.filter(event => {
      // Convert event.date to Date object if it's a string
      const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
      return eventDate >= now && eventDate <= this.currentEndDate;
    });
    
    // Sort events by date - ensure we're working with Date objects
    this.events.sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }

  loadMoreEvents(): void {
    // Extend the end date by the additional days
    this.currentEndDate.setDate(this.currentEndDate.getDate() + this.additionalDays);
    
    // Re-filter the events based on the new end date
    this.filterEventsForDisplay();
  }

  // Handle image loading errors by setting a fallback image
  handleImageError(event: any): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement && imgElement.src) {
      imgElement.src = '/public/noimage.jpg';
    }
  }

  // Format date in Portuguese
  formatDateInPortuguese(date: Date): string {
    // Portuguese month names
    const ptMonths = [
      'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
      'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
    ];
    
    const day = date.getDate();
    const month = ptMonths[date.getMonth()];
    
    return `${day} ${month}`;
  }
}

import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

interface Event {
  id: number;
  name: string;
  description: string;
  date: Date;
  time: Date;
  duration: number; //Time duration represented in minutes
  departament: string;
  status: string;
  reminder: string;
  notes: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: Event[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  title = 'Calendar';
  events: Event[] = [];
  calendarDays: CalendarDay[] = [];
  currentDate = new Date();
  currentMonth: number;
  currentYear: number;
  weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  constructor(private http: HttpClient) {
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
  }

  ngOnInit(): void {
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
      // Process and convert dates properly
      this.events = events.map(event => {
        // Create proper Date objects from the API response
        const dateObj = new Date(event.date);
        const timeObj = new Date(event.time);
        
        // Ensure the time is set correctly by combining date and time
        const combinedDateTime = new Date(
          dateObj.getFullYear(),
          dateObj.getMonth(),
          dateObj.getDate(),
          timeObj.getHours(),
          timeObj.getMinutes()
        );
        
        return {
          ...event,
          date: dateObj,
          time: combinedDateTime
        };
      });
      
      console.log('Loaded events:', this.events);
      this.generateCalendar();
    }, error => {
      console.error('Error loading events:', error);
    });
  }

  generateCalendar(): void {
    this.calendarDays = [];
    
    // Get the first day of the month
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    // Get the last day of the month
    const lastDayOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);
    
    // Get the day of the week the first day falls on (0-6)
    const firstDayWeekday = firstDayOfMonth.getDay();
    
    // Add days from previous month to fill the first week
    const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
    for (let i = 0; i < firstDayWeekday; i++) {
      const date = new Date(this.currentYear, this.currentMonth - 1, prevMonthLastDay - firstDayWeekday + i + 1);
      this.calendarDays.push({
        date,
        isCurrentMonth: false,
        isToday: this.isToday(date),
        events: this.getEventsForDate(date)
      });
    }
    
    // Add days for current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(this.currentYear, this.currentMonth, i);
      const eventsForDate = this.getEventsForDate(date);
      this.calendarDays.push({
        date,
        isCurrentMonth: true,
        isToday: this.isToday(date),
        events: eventsForDate
      });
    }
    
    // Add days from next month to complete the last week
    const remainingDays = 42 - this.calendarDays.length; // 6 rows of 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(this.currentYear, this.currentMonth + 1, i);
      this.calendarDays.push({
        date,
        isCurrentMonth: false,
        isToday: this.isToday(date),
        events: this.getEventsForDate(date)
      });
    }
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  getEventsForDate(date: Date): Event[] {
    if (!this.events || this.events.length === 0) {
      return [];
    }
    
    return this.events.filter(event => {
      if (!event.date) return false;
      
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  }

  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  goToToday(): void {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.generateCalendar();
  }
}

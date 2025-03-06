import { NgIf } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

interface PrayerRequest {
  name: string;
  email: string;
  request: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Prayer Request Form';
  
  prayerRequest: PrayerRequest = {
    name: '',
    email: '',
    request: ''
  };
  
  submitted = false;
  http: any;

  onSubmit(form: NgForm): void {
    if (form.valid) {
      console.log('Prayer request submitted:', this.prayerRequest);
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + btoa('daniel:daniel')
        })
      };
      this.http.post('http://192.168.1.123:7771/api/v1/prayers/', this.prayerRequest, httpOptions).subscribe((response: any) => {
        console.log('Prayer request posted successfully:', response);
      });
      
      this.submitted = true;
      
      // Reset the form after submission
      setTimeout(() => {
        this.prayerRequest = {
          name: '',
          email: '',
          request: ''
        };
        form.resetForm();
        this.submitted = false;
      }, 5000);
    }
  }
}

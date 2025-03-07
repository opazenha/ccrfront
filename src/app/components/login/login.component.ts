import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

interface LoginRequest {
  username: string;
  password: string;
}

interface PrayerRequest {
  id: number;
  requesterId: number;
  status: string;
  prayerRequest: string;
}

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  title = 'Login';

  loginRequest : LoginRequest = { username: '', password: '' };
  response: string | null = null;
  prayerRequests: PrayerRequest[] = [];

  constructor(private http: HttpClient) {}

  onSubmit(form: NgForm): void {
    if (form.valid) {
      console.log('Login request submitted:', this.loginRequest);
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('daniel:daniel')
        })
      };

      this.http.get('http://localhost:7771/api/v1/prayers/', httpOptions).subscribe(
        (response: any) => {
          this.prayerRequests = response.map((prayerRequest: any) => ({
            id: prayerRequest.id,
            requesterId: prayerRequest.requesterId,
            status: prayerRequest.status,
            prayerRequest: prayerRequest.prayerRequest
          }));
          this.response = 'Login successful, prayers retrieved\nID: ' + this.prayerRequests[0].id + '\nStatus: ' + this.prayerRequests[0].status + '\nPrayer Request: ' + this.prayerRequests[0].prayerRequest;
          console.log(this.response);
        },
        (error) => {
          console.error('Error during login:', error);
        }
      );
    }
  }
}
import { NgIf, CommonModule } from '@angular/common';
import { HttpHeaders, HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

interface PrayerRequest {
  name: string;
  email: string;
  request: string;
}

interface User {
  name: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-prayer-request',
  standalone: true,
  imports: [FormsModule, NgIf, CommonModule, HttpClientModule],
  templateUrl: './prayer-request.component.html',
  styleUrl: './prayer-request.component.css'
})
export class PrayerRequestComponent {
  title = 'Pedido de Oração';
  
  prayerRequest: PrayerRequest = {
    name: '',
    email: '',
    request: ''
  };
  
  submitted = false;
  showUserRegistration = false;
  registrationError = '';
  registrationSuccess = false;
  
  newUser: User = {
    name: '',
    email: '',
    password: ''
  };

  constructor(private http: HttpClient) {}

  onSubmit(form: NgForm): void {
    if (form.valid) {
      console.log('Prayer request submitted:', this.prayerRequest);
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + btoa('daniel:daniel')
        })
      };
      
      this.http.post<any>('http://localhost:7771/api/v1/prayers/', this.prayerRequest, httpOptions).subscribe(
        (response: any) => {
          console.log('Prayer request posted successfully:', response);
          this.submitted = true;
          this.showUserRegistration = false;
          
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
        },
        (error: HttpErrorResponse) => {
          console.error('Error submitting prayer request:', error);
          
          // Check if the error is 400 "User not found"
          if (error.status === 400 && 
              error.error && 
              typeof error.error === 'object' && 
              'detail' in error.error && 
              error.error.detail === 'User not found') {
            
            console.log('User not found, showing registration form');
            this.showUserRegistration = true;
            
            // Pre-fill user registration form with prayer request data
            this.newUser.name = this.prayerRequest.name;
            this.newUser.email = this.prayerRequest.email;
          }
        }
      );
    }
  }
  
  registerUser(form: NgForm): void {
    if (form.valid) {
      console.log('Registering new user:', this.newUser);
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + btoa('daniel:daniel')
        })
      };
      
      this.http.post<any>('http://localhost:7771/api/v1/users/', this.newUser, httpOptions).subscribe(
        (response: any) => {
          console.log('User registered successfully:', response);
          this.registrationSuccess = true;
          this.registrationError = '';
          
          // Try to submit the prayer request again after successful registration
          setTimeout(() => {
            this.showUserRegistration = false;
            this.registrationSuccess = false;
            
            // Submit the prayer request again with the new user
            this.http.post<any>('http://localhost:7771/api/v1/prayers/', this.prayerRequest, httpOptions).subscribe(
              (response: any) => {
                console.log('Prayer request posted successfully after registration:', response);
                this.submitted = true;
                
                // Reset the form after submission
                setTimeout(() => {
                  this.prayerRequest = {
                    name: '',
                    email: '',
                    request: ''
                  };
                  this.newUser = {
                    name: '',
                    email: '',
                    password: ''
                  };
                  form.resetForm();
                  this.submitted = false;
                }, 5000);
              },
              (error) => {
                console.error('Error submitting prayer request after registration:', error);
              }
            );
          }, 2000);
        },
        (error) => {
          console.error('Error registering user:', error);
          this.registrationError = 'Ocorreu um erro ao registrar. Por favor, tente novamente.';
        }
      );
    }
  }
  
  cancelRegistration(): void {
    this.showUserRegistration = false;
    this.registrationError = '';
    this.newUser = {
      name: '',
      email: '',
      password: ''
    };
  }
}

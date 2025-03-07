import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import localePtBr from '@angular/common/locales/pt';

// Register the pt-BR locale data
registerLocaleData(localePtBr, 'pt-BR');

interface Newsletter {
  id: number;
  date: string;
  content: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './newsletter.component.html',
  styleUrl: './newsletter.component.css',
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
})
export class NewsletterComponent implements OnInit, OnDestroy {
  newsletters: Newsletter[] = [];
  currentSlide = 0;
  emailForm: FormGroup;
  userForm: FormGroup;
  showUserForm = false;
  submitting = false;
  submitted = false;
  errorMessage = '';
  private autoSlideSubscription?: Subscription;
  
  constructor(
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  
  ngOnInit(): void {
    this.fetchNewsletters();
    // Set up auto-scrolling every 5 seconds
    this.startAutoSlide();
  }
  
  ngOnDestroy(): void {
    // Clean up subscription when component is destroyed
    this.stopAutoSlide();
  }
  
  startAutoSlide(): void {
    this.stopAutoSlide(); // Clear any existing subscription
    this.autoSlideSubscription = interval(5000).subscribe(() => {
      this.nextSlide();
    });
  }
  
  stopAutoSlide(): void {
    if (this.autoSlideSubscription) {
      this.autoSlideSubscription.unsubscribe();
      this.autoSlideSubscription = undefined;
    }
  }
  
  fetchNewsletters(): void {
    // Create Basic auth header by encoding username:password in base64
    const credentials = btoa('daniel:daniel');
    
    this.http.get<Newsletter[]>('http://localhost:7771/newsletters', {
      headers: new HttpHeaders({
        Authorization: `Basic ${credentials}`
      })
    })
      .subscribe({
        next: (data) => {
          // Sort newsletters by date (newest first) and get the last 4
          this.newsletters = data
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 4);
        },
        error: (error) => {
          console.error('Error fetching newsletters:', error);
          // Create some mock newsletters for testing if API fails
          this.createMockNewsletters();
        }
      });
  }
  
  createMockNewsletters(): void {
    // Create mock data if API fails
    this.newsletters = [
      { id: 1, date: '2025-03-07', content: '<h2>Últimas atualizações da nossa igreja</h2><p>Temos novidades empolgantes para nossos próximos eventos...</p>' },
      { id: 2, date: '2025-03-01', content: '<h2>Informativo de Fevereiro</h2><p>O mês passado foi repleto de bênçãos e maravilhosas atividades comunitárias...</p>' },
      { id: 3, date: '2025-02-15', content: '<h2>Atualização de Meados de Fevereiro</h2><p>Junte-se a nós para nossa reunião especial de oração neste fim de semana...</p>' },
      { id: 4, date: '2025-02-01', content: '<h2>Informativo de Janeiro</h2><p>Feliz Ano Novo para nossa maravilhosa comunidade! Aqui estão nossos planos para 2025...</p>' }
    ];
  }

  previousSlide(): void {
    this.currentSlide = this.currentSlide === 0 ? this.newsletters.length - 1 : this.currentSlide - 1;
    this.restartAutoSlide();
  }

  nextSlide(): void {
    this.currentSlide = this.currentSlide === this.newsletters.length - 1 ? 0 : this.currentSlide + 1;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.restartAutoSlide();
  }
  
  restartAutoSlide(): void {
    // Restart the auto-slide timer when user interacts with the carousel
    this.stopAutoSlide();
    this.startAutoSlide();
  }

  checkUserEmail(): void {
    if (this.emailForm.invalid) {
      return;
    }
    
    const email = this.emailForm.get('email')?.value;
    this.submitting = true;
    
    this.http.get<User>(`http://localhost:7771/api/v1/users/email/${email}`)
      .subscribe({
        next: (user) => {
          // User exists
          this.submitting = false;
          this.submitted = true;
          this.showUserForm = false;
        },
        error: (error) => {
          if (error.status === 404) {
            // User doesn't exist, show registration form
            this.showUserForm = true;
            this.userForm.patchValue({ email });
          } else {
            this.errorMessage = 'Ocorreu um erro. Por favor, tente novamente.';
            console.error('Error checking user email:', error);
          }
          this.submitting = false;
        }
      });
  }
  
  registerUser(): void {
    if (this.userForm.invalid) {
      return;
    }
    
    this.submitting = true;
    
    this.http.post<User>('http://localhost:7771/api/v1/users/', this.userForm.value)
      .subscribe({
        next: (response) => {
          this.submitting = false;
          this.submitted = true;
          this.showUserForm = false;
        },
        error: (error) => {
          this.errorMessage = 'Falha no registro. Por favor, tente novamente.';
          console.error('Error registering user:', error);
          this.submitting = false;
        }
      });
  }
  
  resetForms(): void {
    this.submitted = false;
    this.showUserForm = false;
    this.emailForm.reset();
    this.userForm.reset();
    this.errorMessage = '';
  }
}

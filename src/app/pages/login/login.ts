import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  loading = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      const role = this.authService.getUserRole();
      if (role === 'manager') {
        this.router.navigate(['/manager-dashboard']);
      } else {
        this.router.navigate(['/employee-dashboard']);
      }
    }

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    // Stop if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    const { email, password } = this.loginForm.value;

    this.authService
      .login(email, password)
      .then((result) => {
        const role = result.role;
        if (role === 'manager') {
          this.router.navigate(['/manager-dashboard']);
        } else {
          this.router.navigate(['/employee-dashboard']);
        }
      })
      .catch((error) => {
        this.errorMessage = error.message || 'An error occurred. Please try again.';
        this.loading = false;
      });
  }
  
  goToSignup() {
    this.router.navigate(['/signup']);
  }
}

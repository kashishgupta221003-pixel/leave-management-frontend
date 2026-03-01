import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.css'
})
export class Signup {
  email = '';
  password = '';
  errorMessage = '';
  loading = false;          

  constructor(private authService: AuthService, private router: Router) {}

  async onSignup() {
    this.errorMessage = '';
    this.loading = true;
    try {
      await this.authService.signup(this.email, this.password);
      this.router.navigate(['/employee-dashboard']);
      window.location.reload();
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
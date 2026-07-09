import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css', '../login/login.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class SignupComponent {
  name = '';
  username = '';
  email = '';
  phone = '';
  password = '';
  role: 'admin' | 'employee' = 'employee';
  error = '';
  success = false;

  constructor(private authService: AuthService, private router: Router) {}

  signup() {
    this.error = '';
    this.success = false;
    
    if (!this.name || !this.username || !this.email || !this.phone || !this.password) {
      this.error = 'All fields are required.';
      return;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(this.email)) {
      this.error = 'Invalid email format.';
      return;
    }
    
    if (!/^\d+$/.test(this.phone)) {
      this.error = 'Phone number must contain only digits.';
      return;
    }

    const newUser = {
      name: this.name,
      username: this.username,
      email: this.email,
      phone: this.phone,
      password: this.password,
      role: this.role
    };

    this.authService.signup(newUser).subscribe(success => {
      if (success) {
        this.success = true;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      } else {
        this.error = 'Username already exists.';
      }
    });
  }
}

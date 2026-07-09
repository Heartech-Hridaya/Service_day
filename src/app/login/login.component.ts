import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('shake', [
      state('idle', style({ transform: 'translateX(0)' })),
      state('shaking', style({ transform: 'translateX(0)' })),
      transition('idle => shaking', [
        animate('60ms', style({ transform: 'translateX(-8px)' })),
        animate('60ms', style({ transform: 'translateX(8px)' })),
        animate('60ms', style({ transform: 'translateX(-8px)' })),
        animate('60ms', style({ transform: 'translateX(8px)' })),
        animate('60ms', style({ transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class LoginComponent {
  username = '';
  password = '';
  role: 'admin' | 'employee' = 'employee';
  error = '';
  shakeState: 'idle' | 'shaking' = 'idle';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.error = '';
    this.authService.login(this.username, this.password, this.role).subscribe(success => {
      if (success) {
        const user = this.authService.getCurrentUser();
        if (user?.role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/employee/list']);
        }
      } else {
        this.error = 'Invalid username or password';
        this.shakeState = 'shaking';
        setTimeout(() => (this.shakeState = 'idle'), 400);
      }
    });
  }
}

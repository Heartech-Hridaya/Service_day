import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';
import { ToastService } from '../../shared/toast.service';
import { RegistrationService } from '../../services/registration.service';
import { NgoService } from '../../services/ngo.service';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = {};
  totalRegistrations = 0;
  checkedInCount = 0;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private registrationService: RegistrationService,
    private ngoService: NgoService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user = { ...currentUser };
    }
    combineLatest([
      this.registrationService.getRegistrations(),
      this.ngoService.getNgos()
    ]).pipe(
      map(([regs]) => regs.filter(r => r.employeeName === this.user.name))
    ).subscribe(myRegs => {
      this.totalRegistrations = myRegs.length;
      this.checkedInCount = myRegs.filter(r => r.checkedIn).length;
    });
  }

  saveProfile() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      currentUser.name = this.user.name;
      (currentUser as any).email = this.user.email;
      (currentUser as any).phone = this.user.phone;
      this.toastService.show('Profile updated successfully!', 'success');
    }
  }

  getInitials(): string {
    if (!this.user.name) return '?';
    return this.user.name.split(' ')
      .map((w: string) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}

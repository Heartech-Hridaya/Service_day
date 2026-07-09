import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Registration } from '../../models/registration';
import { Ngo } from '../../models/ngo';
import { RegistrationService } from '../../services/registration.service';
import { NgoService } from '../../services/ngo.service';
import { AuthService } from '../../services/auth.service';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationService } from '../../services/notification.service';
import { ToastService } from '../../shared/toast.service';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

interface RegistrationViewModel {
  registration: Registration;
  ngo: Ngo | undefined;
  canCancel: boolean;
}

@Component({
  selector: 'app-my-registrations',
  templateUrl: './my-registrations.component.html',
  styleUrls: ['./my-registrations.component.css'],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger('50ms', [
            animate('300ms ease-in-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true }),
        query(':leave', [
          animate('300ms ease-in-out', style({ opacity: 0, height: 0, margin: 0, padding: 0 }))
        ], { optional: true })
      ])
    ])
  ]
})
export class MyRegistrationsComponent implements OnInit {
  myRegistrations$: Observable<RegistrationViewModel[]>;
  employeeName: string | null = null;

  constructor(
    private registrationService: RegistrationService,
    private ngoService: NgoService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private toastService: ToastService
  ) {
    this.employeeName = this.authService.getCurrentUser()?.name || null;

    this.myRegistrations$ = combineLatest([
      this.registrationService.getRegistrations(),
      this.ngoService.getNgos()
    ]).pipe(
      map(([registrations, ngos]) => {
        const myRegs = registrations.filter(r => r.employeeName === this.employeeName);
        return myRegs.map(reg => {
          const ngo = ngos.find(n => n.id === reg.ngoId);
          let canCancel = false;
          if (ngo) {
            canCancel = !this.ngoService.isCutoffPassed(ngo);
          }
          return { registration: reg, ngo, canCancel };
        });
      })
    );
  }

  ngOnInit(): void {}

  cancelRegistration(regView: RegistrationViewModel) {
    if (!regView.canCancel || !regView.ngo) {
      this.toastService.show('Cannot cancel after cutoff date.', 'error');
      return;
    }
    this.registrationService.cancelRegistration(regView.registration.id);
    this.ngoService.decrementSlots(regView.ngo.id);
    this.notificationService.addNotification({
      id: 0,
      message: `Your registration for ${regView.ngo.name} was cancelled.`,
      type: 'cancellation',
      timestamp: new Date().toISOString(),
      read: false
    });
    this.toastService.show(`Registration for ${regView.ngo.name} cancelled.`, 'success');
  }

  changeActivity(regView: RegistrationViewModel) {
    if (!regView.canCancel || !regView.ngo) {
      this.toastService.show('Cannot change activity after cutoff date.', 'error');
      return;
    }
    this.registrationService.cancelRegistration(regView.registration.id);
    this.ngoService.decrementSlots(regView.ngo.id);
    this.notificationService.addNotification({
      id: 0,
      message: `Your registration for ${regView.ngo.name} was cancelled.`,
      type: 'cancellation',
      timestamp: new Date().toISOString(),
      read: false
    });
    this.toastService.show('Registration cancelled. Please select a new activity.', 'info');
    this.router.navigate(['/employee/list']);
  }
}

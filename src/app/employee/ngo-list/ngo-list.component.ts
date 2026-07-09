import { Component, OnInit } from '@angular/core';
import { Ngo } from '../../models/ngo';
import { NgoService } from '../../services/ngo.service';
import { RegistrationService } from '../../services/registration.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../shared/toast.service';
import { Observable } from 'rxjs';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-ngo-list',
  templateUrl: './ngo-list.component.html',
  styleUrls: ['./ngo-list.component.css'],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger('50ms', [
            animate('300ms ease-in-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('badgeAnimation', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('300ms ease-in-out', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ])
  ]
})
export class NgoListComponent implements OnInit {
  ngos$: Observable<Ngo[]>;

  constructor(
    private ngoService: NgoService,
    private registrationService: RegistrationService,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.ngos$ = this.ngoService.getNgos();
  }

  ngOnInit(): void {}

  isRegistrationClosed(ngo: Ngo): boolean {
    return this.ngoService.isRegistrationClosed(ngo);
  }

  register(ngo: Ngo) {
    if (this.isRegistrationClosed(ngo)) {
      this.toastService.show('Registration is closed for this activity.', 'error');
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user) {
      this.toastService.show('Please login first.', 'error');
      return;
    }

    // B1 Fix: prevent duplicate registration for the same NGO
    if (this.registrationService.isAlreadyRegistered(ngo.id, user.name)) {
      this.toastService.show(`You are already registered for "${ngo.name}".`, 'error');
      return;
    }

    this.registrationService.addRegistration({
      id: 0,
      ngoId: ngo.id,
      employeeName: user.name,
      checkedIn: false
    });

    this.ngoService.incrementSlots(ngo.id);
    this.toastService.show('Successfully registered for ' + ngo.name, 'success');
  }
}

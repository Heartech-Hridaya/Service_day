import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { RegistrationService } from '../../services/registration.service';
import { NgoService } from '../../services/ngo.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../shared/toast.service';
import { Registration } from '../../models/registration';
import { Ngo } from '../../models/ngo';
import { trigger, transition, style, animate } from '@angular/animations';

interface CheckInOption {
  registration: Registration;
  ngo: Ngo;
}

@Component({
  selector: 'app-check-in',
  templateUrl: './check-in.component.html',
  styleUrls: ['./check-in.component.css'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class CheckInComponent implements OnInit {
  /** Registrations available for check-in (registered but not yet checked in) */
  available$: Observable<CheckInOption[]>;
  selectedRegistrationId: number | null = null;
  confirmed = false;
  checkedInNgoName = '';

  constructor(
    private registrationService: RegistrationService,
    private ngoService: NgoService,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    const employeeName = this.authService.getCurrentUser()?.name ?? '';

    this.available$ = combineLatest([
      this.registrationService.getRegistrations(),
      this.ngoService.getNgos()
    ]).pipe(
      map(([regs, ngos]) =>
        regs
          .filter(r => r.employeeName === employeeName && !r.checkedIn)
          .map(r => {
            const ngo = ngos.find(n => n.id === r.ngoId);
            return ngo ? { registration: r, ngo } : null;
          })
          .filter((x): x is CheckInOption => x !== null)
      )
    );
  }

  ngOnInit(): void {}

  checkIn() {
    if (!this.selectedRegistrationId) {
      this.toastService.show('Please select an activity to check in to.', 'error');
      return;
    }

    // Find name for confirmation message (read synchronously from service)
    this.registrationService.getRegistrations().pipe(
      map(regs => regs.find(r => r.id === this.selectedRegistrationId))
    ).subscribe(reg => {
      if (!reg) return;
      this.ngoService.getNgos().pipe(
        map(ngos => ngos.find(n => n.id === reg.ngoId))
      ).subscribe(ngo => {
        if (!ngo) return;
        this.registrationService.checkIn(this.selectedRegistrationId!);
        this.checkedInNgoName = ngo.name;
        this.confirmed = true;
        this.selectedRegistrationId = null;
        this.toastService.show(`Checked in to "${ngo.name}"!`, 'success');
      });
    });
  }

  resetConfirmation() {
    this.confirmed = false;
    this.checkedInNgoName = '';
  }
}

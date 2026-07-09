import { Component, OnInit } from '@angular/core';
import { RegistrationService } from '../../services/registration.service';
import { NgoService } from '../../services/ngo.service';
import { ToastService } from '../../shared/toast.service';
import { Registration } from '../../models/registration';
import { Ngo } from '../../models/ngo';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface AttendanceRecord {
  registration: Registration;
  ngoName: string;
}

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {
  attendanceList$: Observable<AttendanceRecord[]>;
  filteredList$: Observable<AttendanceRecord[]>;

  private filterSubject = new BehaviorSubject<string>('');
  filterText = '';

  totalCount = 0;
  checkedInCount = 0;
  pendingCount = 0;

  constructor(
    private registrationService: RegistrationService,
    private ngoService: NgoService,
    private toastService: ToastService
  ) {
    this.attendanceList$ = combineLatest([
      this.registrationService.getRegistrations(),
      this.ngoService.getNgos()
    ]).pipe(
      map(([regs, ngos]) => {
        return regs.map(reg => {
          const ngo = ngos.find(n => n.id === reg.ngoId);
          return {
            registration: reg,
            ngoName: ngo ? ngo.name : 'Unknown Activity'
          };
        });
      })
    );

    this.filteredList$ = combineLatest([
      this.attendanceList$,
      this.filterSubject.asObservable()
    ]).pipe(
      map(([list, filter]) => {
        if (!filter.trim()) return list;
        const q = filter.toLowerCase();
        return list.filter(r =>
          r.registration.employeeName.toLowerCase().includes(q) ||
          r.ngoName.toLowerCase().includes(q)
        );
      })
    );
  }

  ngOnInit(): void {
    this.attendanceList$.subscribe(list => {
      this.totalCount = list.length;
      this.checkedInCount = list.filter(r => r.registration.checkedIn).length;
      this.pendingCount = list.filter(r => !r.registration.checkedIn).length;
    });
  }

  onFilterChange() {
    this.filterSubject.next(this.filterText);
  }

  toggleCheckIn(record: AttendanceRecord) {
    const reg = record.registration;
    reg.checkedIn = !reg.checkedIn;
    if (reg.checkedIn) {
      reg.arrivalTime = new Date().toISOString();
    } else {
      reg.arrivalTime = undefined;
    }
    this.toastService.show(
      reg.checkedIn
        ? `✔ Checked in: ${reg.employeeName}`
        : `↩ Check-in undone for ${reg.employeeName}`,
      reg.checkedIn ? 'success' : 'info'
    );
  }
}

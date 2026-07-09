import { Component, OnInit } from '@angular/core';
import { NgoService } from '../../services/ngo.service';
import { RegistrationService } from '../../services/registration.service';
import { NotificationService } from '../../services/notification.service';
import { ToastService } from '../../shared/toast.service';
import { ReminderConfigService, ReminderConfig } from '../../services/reminder-config.service';
import { Ngo } from '../../models/ngo';
import { Registration } from '../../models/registration';
import { Observable, combineLatest, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

export interface CheckInView {
  ngoId: number;
  ngoName: string;
  date: string;
  checkedIn: CheckInEntry[];
  notCheckedIn: string[];
}

export interface CheckInEntry {
  name: string;
  arrivalTime: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  ngos$: Observable<Ngo[]>;
  ngoLabels$: Observable<string[]>;
  liveCheckIns$: Observable<CheckInView[]>;
  ngoRegistrationsData$!: Observable<any[]>;
  broadcastText = '';
  config: ReminderConfig;

  totalActiveNgos = 0;
  totalSlotsBooked = 0;
  totalSlotsRemaining = 0;
  totalEmployees = 0;

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: { x: {}, y: { min: 0 } }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Slots Booked', backgroundColor: '#E8935A' },
      { data: [], label: 'Slots Remaining', backgroundColor: '#E8EBE9' }
    ]
  };

  constructor(
    private ngoService: NgoService,
    private registrationService: RegistrationService,
    private notificationService: NotificationService,
    private toastService: ToastService,
    private reminderConfigService: ReminderConfigService
  ) {
    this.ngos$ = this.ngoService.getNgos();
    this.ngoLabels$ = this.ngos$.pipe(map(ngos => ngos.map(n => n.name)));
    this.config = { ...this.reminderConfigService.getConfig() };

    this.liveCheckIns$ = combineLatest([
      this.ngos$,
      this.registrationService.getRegistrations()
    ]).pipe(
      map(([ngos, regs]: [Ngo[], Registration[]]) =>
        ngos.map(ngo => {
          const ngoRegs = regs.filter(r => r.ngoId === ngo.id);
          return {
            ngoId: ngo.id,
            ngoName: ngo.name,
            date: ngo.date,
            checkedIn: ngoRegs
              .filter(r => r.checkedIn)
              .map(r => ({ name: r.employeeName, arrivalTime: r.arrivalTime ?? '' })),
            notCheckedIn: ngoRegs
              .filter(r => !r.checkedIn)
              .map(r => r.employeeName)
          };
        }).filter(v => (v.checkedIn.length + v.notCheckedIn.length) > 0)
      )
    );
  }

  ngOnInit(): void {
    combineLatest([
      this.ngos$,
      this.registrationService.getRegistrations()
    ]).subscribe(([ngos, regs]) => {
      this.totalActiveNgos = ngos.length;
      this.totalSlotsBooked = 0;
      this.totalSlotsRemaining = 0;
      
      const uniqueEmployees = new Set(regs.map(r => r.employeeName));
      this.totalEmployees = uniqueEmployees.size;

      const labels: string[] = [];
      const bookedData: number[] = [];
      const remainingData: number[] = [];

      ngos.forEach(ngo => {
        this.totalSlotsBooked += ngo.slotsTaken;
        this.totalSlotsRemaining += Math.max(0, ngo.maxSlots - ngo.slotsTaken);
        
        labels.push(ngo.name);
        bookedData.push(ngo.slotsTaken);
        remainingData.push(Math.max(0, ngo.maxSlots - ngo.slotsTaken));
      });

      this.barChartData.labels = labels;
      this.barChartData.datasets[0].data = bookedData;
      this.barChartData.datasets[1].data = remainingData;
      
      this.ngoRegistrationsData$ = of([...ngos]);
      this.barChartData = { ...this.barChartData };
    });
  }

  sendReminder(ngo: Ngo) {
    this.toastService.show(`Reminder queued for volunteers of "${ngo.name}".`, 'info');
  }

  showCutoffMessage(ngoName: string) {
    this.toastService.show(`Registration for ${ngoName} is closed.`, 'error');
  }

  sendBroadcast() {
    const msg = this.broadcastText.trim();
    if (!msg) {
      this.toastService.show('Please enter a message before broadcasting.', 'error');
      return;
    }
    this.notificationService.addBroadcast(`📢 Announcement: ${msg}`);
    this.toastService.show('Broadcast sent to all employees.', 'success');
    this.broadcastText = '';
  }

  saveConfig() {
    this.reminderConfigService.setConfig({ ...this.config });
    this.toastService.show('Reminder schedule updated.', 'success');
  }
}

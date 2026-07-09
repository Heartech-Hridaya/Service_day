import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service';
import { NgoService } from './services/ngo.service';
import { RegistrationService } from './services/registration.service';
import { ReminderConfigService } from './services/reminder-config.service';
import { Registration } from './models/registration';
import { Ngo } from './models/ngo';
import { Subscription, interval } from 'rxjs';
import { take, filter } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';

interface ReminderInterval {
  key: string;
  days: number;
  label: string;
  configProp: 'oneWeek' | 'threeDays' | 'oneDay';
}

const REMINDER_INTERVALS: ReminderInterval[] = [
  { key: '7day', days: 7, label: '1 week',  configProp: 'oneWeek'   },
  { key: '3day', days: 3, label: '3 days',  configProp: 'threeDays' },
  { key: '1day', days: 1, label: '1 day',   configProp: 'oneDay'    }
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'service-day-dashboard';
  isAuthRoute = false;
  private reminderSub?: Subscription;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private registrationService: RegistrationService,
    private ngoService: NgoService,
    private reminderConfigService: ReminderConfigService,
    private router: Router
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAuthRoute = event.url === '/login' || event.url === '/signup' || event.url === '/';
    });
  }

  ngOnInit() {
    // Check every 10 seconds (demo interval — production would use a longer period)
    this.reminderSub = interval(10000).subscribe(() => {
      this.checkReminders();
    });
  }

  ngOnDestroy() {
    this.reminderSub?.unsubscribe();
  }

  checkReminders() {
    const user = this.authService.getCurrentUser();
    if (!user || user.role !== 'employee') return;

    const config = this.reminderConfigService.getConfig();

    this.registrationService.getRegistrations().pipe(take(1)).subscribe((regs: Registration[]) => {
      const myRegs = regs.filter((r: Registration) => r.employeeName === user.name);

      this.ngoService.getNgos().pipe(take(1)).subscribe((ngos: Ngo[]) => {
        const now = new Date();

        myRegs.forEach((reg: Registration) => {
          const ngo = ngos.find((n: Ngo) => n.id === reg.ngoId);
          if (!ngo) return;

          const eventDate = new Date(ngo.date);

          REMINDER_INTERVALS.forEach(interval => {
            if (!config[interval.configProp]) return;
            if (this.reminderConfigService.hasFired(reg.id, interval.key)) return;

            const targetDate = new Date(now);
            targetDate.setDate(targetDate.getDate() + interval.days);

            const sameDay =
              eventDate.getDate() === targetDate.getDate() &&
              eventDate.getMonth() === targetDate.getMonth() &&
              eventDate.getFullYear() === targetDate.getFullYear();

            // Also fire if event is WITHIN the window (event date <= targetDate but > now)
            const withinWindow = eventDate > now && eventDate <= targetDate;

            if (sameDay || withinWindow) {
              this.reminderConfigService.markFired(reg.id, interval.key);
              this.notificationService.addNotification({
                id: 0,
                message: `⏰ Reminder (${interval.label} notice): "${ngo.name}" is on ${ngo.date} at ${ngo.serviceTime}.`,
                type: 'reminder',
                timestamp: new Date().toISOString(),
                read: false
              });
            }
          });
        });
      });
    });
  }
}

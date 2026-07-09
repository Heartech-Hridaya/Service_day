import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ReminderConfig {
  oneWeek:  boolean;
  threeDays: boolean;
  oneDay:   boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ReminderConfigService {
  private configSubject = new BehaviorSubject<ReminderConfig>({
    oneWeek: true,
    threeDays: true,
    oneDay: true
  });

  config$: Observable<ReminderConfig> = this.configSubject.asObservable();

  // Tracks which (registrationId + interval) pairs have already fired.
  // Key format: `${registrationId}_${intervalKey}` e.g. "3_1day"
  private firedReminders = new Set<string>();

  getConfig(): ReminderConfig {
    return this.configSubject.value;
  }

  setConfig(config: ReminderConfig) {
    this.configSubject.next(config);
  }

  hasFired(registrationId: number, intervalKey: string): boolean {
    return this.firedReminders.has(`${registrationId}_${intervalKey}`);
  }

  markFired(registrationId: number, intervalKey: string) {
    this.firedReminders.add(`${registrationId}_${intervalKey}`);
  }

  clearFiredForRegistration(registrationId: number) {
    ['7day', '3day', '1day'].forEach(k =>
      this.firedReminders.delete(`${registrationId}_${k}`)
    );
  }

  reset() {
    this.firedReminders.clear();
    this.configSubject.next({ oneWeek: true, threeDays: true, oneDay: true });
  }
}

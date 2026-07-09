import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Registration } from '../models/registration';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private registrationsSubject = new BehaviorSubject<Registration[]>([]);
  public registrations$ = this.registrationsSubject.asObservable();

  getRegistrations(): Observable<Registration[]> {
    return this.registrations$;
  }

  addRegistration(registration: Registration) {
    const currentRegs = this.registrationsSubject.value;
    const newId = currentRegs.length > 0 ? Math.max(...currentRegs.map(r => r.id)) + 1 : 1;
    const newReg: Registration = { ...registration, id: newId, registrationTime: new Date().toISOString() };
    this.registrationsSubject.next([...currentRegs, newReg]);
  }

  cancelRegistration(id: number) {
    const currentRegs = this.registrationsSubject.value;
    this.registrationsSubject.next(currentRegs.filter(r => r.id !== id));
  }

  /** UC6 — record an employee's check-in arrival time */
  checkIn(registrationId: number) {
    const currentRegs = this.registrationsSubject.value;
    const idx = currentRegs.findIndex(r => r.id === registrationId);
    if (idx === -1) return;
    const updated = [...currentRegs];
    updated[idx] = {
      ...updated[idx],
      checkedIn: true,
      arrivalTime: new Date().toISOString()
    };
    this.registrationsSubject.next(updated);
  }

  /** B1 helper — check if an employee already registered for a given NGO */
  isAlreadyRegistered(ngoId: number, employeeName: string): boolean {
    return this.registrationsSubject.value.some(
      r => r.ngoId === ngoId && r.employeeName === employeeName
    );
  }
}

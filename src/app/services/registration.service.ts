import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Registration } from '../models/registration';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private registrationsSubject = new BehaviorSubject<Registration[]>([]);
  public registrations$ = this.registrationsSubject.asObservable();

  constructor() {
  }

  getRegistrations(): Observable<Registration[]> {
    return this.registrations$;
  }

  addRegistration(registration: Registration) {
    const currentRegs = this.registrationsSubject.value;
    const newId = currentRegs.length > 0 ? Math.max(...currentRegs.map(r => r.id)) + 1 : 1;
    const newReg = { ...registration, id: newId };
    this.registrationsSubject.next([...currentRegs, newReg]);
  }

  cancelRegistration(id: number) {
    const currentRegs = this.registrationsSubject.value;
    const newRegs = currentRegs.filter(r => r.id !== id);
    this.registrationsSubject.next(newRegs);
  }
}

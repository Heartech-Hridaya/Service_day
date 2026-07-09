import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Registration } from '../models/registration';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private registrationsSubject = new BehaviorSubject<Registration[]>([]);
  public registrations$ = this.registrationsSubject.asObservable();
  private apiUrl = 'http://localhost:3000/api/registrations';

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  private loadInitialData() {
    this.http.get<Registration[]>(this.apiUrl).subscribe({
      next: (data) => this.registrationsSubject.next(data),
      error: (err) => console.error('Failed to load registrations', err)
    });
  }

  getRegistrations(): Observable<Registration[]> {
    return this.registrations$;
  }

  addRegistration(registration: Registration) {
    this.http.post<Registration>(this.apiUrl, registration).subscribe({
      next: (newReg) => {
        const currentRegs = this.registrationsSubject.value;
        this.registrationsSubject.next([...currentRegs, newReg]);
      },
      error: (err) => console.error('Failed to add registration', err)
    });
  }

  cancelRegistration(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        const currentRegs = this.registrationsSubject.value;
        this.registrationsSubject.next(currentRegs.filter(r => r.id !== id));
      },
      error: (err) => console.error('Failed to cancel registration', err)
    });
  }

  /** UC6 — record an employee's check-in arrival time */
  checkIn(registrationId: number) {
    const currentRegs = this.registrationsSubject.value;
    const idx = currentRegs.findIndex(r => r.id === registrationId);
    if (idx === -1) return;

    const updated = {
      ...currentRegs[idx],
      checkedIn: true,
      arrivalTime: new Date().toISOString()
    };

    this.http.put<Registration>(`${this.apiUrl}/${registrationId}`, updated).subscribe({
      next: (res) => {
        const newRegs = [...this.registrationsSubject.value];
        const index = newRegs.findIndex(r => r.id === res.id);
        if (index !== -1) {
          newRegs[index] = res;
          this.registrationsSubject.next(newRegs);
        }
      },
      error: (err) => console.error('Failed to check in', err)
    });
  }

  /** B1 helper — check if an employee already registered for a given NGO */
  isAlreadyRegistered(ngoId: number, employeeName: string): boolean {
    return this.registrationsSubject.value.some(
      r => r.ngoId === ngoId && r.employeeName === employeeName
    );
  }
}

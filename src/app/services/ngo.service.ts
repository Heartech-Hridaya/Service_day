import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Ngo } from '../models/ngo';

@Injectable({
  providedIn: 'root'
})
export class NgoService {
  private ngosSubject = new BehaviorSubject<Ngo[]>([]);
  public ngos$ = this.ngosSubject.asObservable();
  private loaded = false;
  private apiUrl = 'http://localhost:3000/api/ngos';

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  private loadInitialData() {
    if (!this.loaded) {
      this.http.get<Ngo[]>(this.apiUrl).subscribe({
        next: (data) => {
          this.ngosSubject.next(data);
          this.loaded = true;
        },
        error: (err) => console.error('Failed to load initial data', err)
      });
    }
  }

  getNgos(): Observable<Ngo[]> {
    return this.ngos$;
  }

  addNgo(ngo: Ngo) {
    this.http.post<Ngo>(this.apiUrl, ngo).subscribe({
      next: (newNgo) => {
        const currentNgos = this.ngosSubject.value;
        this.ngosSubject.next([...currentNgos, newNgo]);
      },
      error: (err) => console.error('Failed to add NGO', err)
    });
  }

  updateNgo(updatedNgo: Ngo) {
    this.http.put<Ngo>(`${this.apiUrl}/${updatedNgo.id}`, updatedNgo).subscribe({
      next: (res) => {
        const currentNgos = this.ngosSubject.value;
        const index = currentNgos.findIndex(n => n.id === res.id);
        if (index !== -1) {
          const newNgos = [...currentNgos];
          newNgos[index] = res;
          this.ngosSubject.next(newNgos);
        }
      },
      error: (err) => console.error('Failed to update NGO', err)
    });
  }

  deleteNgo(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        const currentNgos = this.ngosSubject.value;
        const newNgos = currentNgos.filter(n => n.id !== id);
        this.ngosSubject.next(newNgos);
      },
      error: (err) => console.error('Failed to delete NGO', err)
    });
  }

  isRegistrationClosed(ngo: Ngo): boolean {
    if (ngo.slotsTaken >= ngo.maxSlots) {
      return true;
    }
    return this.isCutoffPassed(ngo);
  }

  isCutoffPassed(ngo: Ngo): boolean {
    const now = new Date();
    const cutoff = new Date(ngo.cutoffDateTime);
    return now > cutoff;
  }

  incrementSlots(ngoId: number) {
    const currentNgos = this.ngosSubject.value;
    const index = currentNgos.findIndex(n => n.id === ngoId);
    if (index !== -1 && currentNgos[index].slotsTaken < currentNgos[index].maxSlots) {
      const updatedNgo = { ...currentNgos[index], slotsTaken: currentNgos[index].slotsTaken + 1 };
      this.http.put<Ngo>(`${this.apiUrl}/${ngoId}`, updatedNgo).subscribe({
        next: (res) => {
          const newNgos = [...this.ngosSubject.value];
          newNgos[index] = res;
          this.ngosSubject.next(newNgos);
        },
        error: (err) => console.error('Failed to increment slots', err)
      });
    }
  }

  decrementSlots(ngoId: number) {
    const currentNgos = this.ngosSubject.value;
    const index = currentNgos.findIndex(n => n.id === ngoId);
    if (index !== -1 && currentNgos[index].slotsTaken > 0) {
      const updatedNgo = { ...currentNgos[index], slotsTaken: currentNgos[index].slotsTaken - 1 };
      this.http.put<Ngo>(`${this.apiUrl}/${ngoId}`, updatedNgo).subscribe({
        next: (res) => {
          const newNgos = [...this.ngosSubject.value];
          newNgos[index] = res;
          this.ngosSubject.next(newNgos);
        },
        error: (err) => console.error('Failed to decrement slots', err)
      });
    }
  }
}

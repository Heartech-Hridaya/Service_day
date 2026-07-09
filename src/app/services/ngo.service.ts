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

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  private loadInitialData() {
    if (!this.loaded) {
      this.http.get<Ngo[]>('/assets/mock-data/ngos.json').subscribe({
        next: (data) => {
          this.ngosSubject.next(data);
          this.loaded = true;
        },
        error: (err) => console.error('Failed to load initial mock data', err)
      });
    }
  }

  getNgos(): Observable<Ngo[]> {
    return this.ngos$;
  }

  addNgo(ngo: Ngo) {
    const currentNgos = this.ngosSubject.value;
    const newId = currentNgos.length > 0 ? Math.max(...currentNgos.map(n => n.id)) + 1 : 1;
    const newNgo = { ...ngo, id: newId };
    
    this.ngosSubject.next([...currentNgos, newNgo]);
  }

  updateNgo(updatedNgo: Ngo) {
    const currentNgos = this.ngosSubject.value;
    const index = currentNgos.findIndex(n => n.id === updatedNgo.id);
    if (index !== -1) {
      const newNgos = [...currentNgos];
      newNgos[index] = updatedNgo;
      this.ngosSubject.next(newNgos);
    }
  }

  deleteNgo(id: number) {
    const currentNgos = this.ngosSubject.value;
    const newNgos = currentNgos.filter(n => n.id !== id);
    this.ngosSubject.next(newNgos);
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
      const newNgos = [...currentNgos];
      newNgos[index] = { ...newNgos[index], slotsTaken: newNgos[index].slotsTaken + 1 };
      this.ngosSubject.next(newNgos);
    }
  }

  decrementSlots(ngoId: number) {
    const currentNgos = this.ngosSubject.value;
    const index = currentNgos.findIndex(n => n.id === ngoId);
    if (index !== -1 && currentNgos[index].slotsTaken > 0) {
      const newNgos = [...currentNgos];
      newNgos[index] = { ...newNgos[index], slotsTaken: newNgos[index].slotsTaken - 1 };
      this.ngosSubject.next(newNgos);
    }
  }
}

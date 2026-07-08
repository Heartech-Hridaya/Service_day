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
}

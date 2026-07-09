import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User {
  username: string;
  name: string;
  role: 'admin' | 'employee';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private users: (User & {password: string})[] = [];
  private usersLoaded = false;
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient, private router: Router) { 
    this.loadUsers().subscribe();
  }

  private loadUsers(): Observable<any> {
    if (this.usersLoaded) return of(this.users);
    return this.http.get<(User & {password: string})[]>(this.apiUrl).pipe(
      tap(users => {
        this.users = users;
        this.usersLoaded = true;
      })
    );
  }

  login(username: string, password: string, role: 'admin' | 'employee'): Observable<boolean> {
    return this.http.post<User>(`${this.apiUrl}/login`, { username, password, role }).pipe(
      map(user => {
        if (user) {
          this.currentUserSubject.next(user);
          return true;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }

  signup(user: User & {password: string}): Observable<boolean> {
    return this.http.post<any>(this.apiUrl, user).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  logout() {
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}

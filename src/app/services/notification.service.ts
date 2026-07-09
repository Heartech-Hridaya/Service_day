import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppNotification } from '../models/notification';
export { AppNotification } from '../models/notification';

export interface ScheduledMessage {
  id: number;
  message: string;
  recipientUsername?: string; // If undefined, it's a broadcast or for all volunteers of an NGO
  targetNgoId?: number;
  triggerDate: Date; // The absolute date/time this should be sent
  sent: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  private apiUrl = 'http://localhost:3000/api/notifications';

  private scheduledMessagesSubject = new BehaviorSubject<ScheduledMessage[]>([]);
  public scheduledMessages$ = this.scheduledMessagesSubject.asObservable();
  private nextSchedId = 1;

  constructor(private http: HttpClient) {
    this.loadInitialData();
    // Check scheduled messages every 10 seconds
    setInterval(() => this.checkScheduledMessages(), 10000);
  }

  private loadInitialData() {
    this.http.get<AppNotification[]>(this.apiUrl).subscribe({
      next: (data) => this.notificationsSubject.next(data),
      error: (err) => console.error('Failed to load notifications', err)
    });
  }

  private checkScheduledMessages() {
    const now = new Date();
    const msgs = this.scheduledMessagesSubject.value;
    let updated = false;

    msgs.forEach(msg => {
      if (!msg.sent && msg.triggerDate <= now) {
        msg.sent = true;
        updated = true;
        this.addNotification({
          id: 0,
          message: msg.message,
          type: 'broadcast', // Or 'reminder'
          timestamp: new Date().toISOString(),
          read: false,
          recipientUsername: msg.recipientUsername
        } as any); // Type cast since recipientUsername was added
      }
    });

    if (updated) {
      this.scheduledMessagesSubject.next([...msgs]);
    }
  }

  getScheduledMessages(): Observable<ScheduledMessage[]> {
    return this.scheduledMessages$;
  }

  addScheduledMessage(msg: Omit<ScheduledMessage, 'id' | 'sent'>) {
    const newMsg: ScheduledMessage = { ...msg, id: this.nextSchedId++, sent: false };
    const current = this.scheduledMessagesSubject.value;
    this.scheduledMessagesSubject.next([newMsg, ...current]);
  }

  deleteScheduledMessage(id: number) {
    const current = this.scheduledMessagesSubject.value;
    this.scheduledMessagesSubject.next(current.filter(m => m.id !== id));
  }

  getNotifications(): Observable<AppNotification[]> {
    return this.notifications$;
  }

  getUnreadCount(): Observable<number> {
    return this.notifications$.pipe(
      map(notes => notes.filter(n => !n.read).length)
    );
  }

  addNotification(notification: AppNotification) {
    this.http.post<AppNotification>(this.apiUrl, notification).subscribe({
      next: (newNote) => {
        const current = this.notificationsSubject.value;
        this.notificationsSubject.next([newNote, ...current]);
      },
      error: (err) => console.error('Failed to add notification', err)
    });
  }

  /** UC5 — create a broadcast notification visible to all employees */
  addBroadcast(message: string) {
    this.addNotification({
      id: 0,
      message,
      type: 'broadcast',
      timestamp: new Date().toISOString(),
      read: false
    });
  }

  markAsRead(id: number) {
    const current = this.notificationsSubject.value;
    const notification = current.find(n => n.id === id);
    if (!notification) return;

    const updated = { ...notification, read: true };
    this.http.put<AppNotification>(`${this.apiUrl}/${id}`, updated).subscribe({
      next: (res) => {
        const newNotes = current.map(n => n.id === id ? res : n);
        this.notificationsSubject.next(newNotes);
      },
      error: (err) => console.error('Failed to mark as read', err)
    });
  }

  markAllRead() {
    const current = this.notificationsSubject.value;
    const unreadNotes = current.filter(n => !n.read);
    unreadNotes.forEach(n => this.markAsRead(n.id));
  }
}

import { Injectable } from '@angular/core';
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
  private nextId = 1;

  private scheduledMessagesSubject = new BehaviorSubject<ScheduledMessage[]>([]);
  public scheduledMessages$ = this.scheduledMessagesSubject.asObservable();
  private nextSchedId = 1;

  constructor() {
    // Check scheduled messages every 10 seconds
    setInterval(() => this.checkScheduledMessages(), 10000);
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
    const current = this.notificationsSubject.value;
    notification.id = this.nextId++;
    this.notificationsSubject.next([notification, ...current]);
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
    const updated = current.map(n => n.id === id ? { ...n, read: true } : n);
    this.notificationsSubject.next(updated);
  }

  markAllRead() {
    const updated = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(updated);
  }
}

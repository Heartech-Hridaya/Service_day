import { Component, OnInit } from '@angular/core';
import { NotificationService, AppNotification } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications$: Observable<AppNotification[]>;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {
    const user = this.authService.getCurrentUser();
    this.notifications$ = this.notificationService.getNotifications().pipe(
      map(notes => notes.filter(n => !n.recipientUsername || n.recipientUsername === user?.name))
    );
  }

  ngOnInit(): void {}

  markAsRead(id: number) {
    this.notificationService.markAsRead(id);
  }

  markAllRead() {
    this.notificationService.markAllRead();
  }
}

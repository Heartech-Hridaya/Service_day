import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';
import { NotificationService, AppNotification } from '../../services/notification.service';
import { Observable, Subscription } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-8px)' }),
        animate('250ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-8px)' }))
      ])
    ])
  ]
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;
  notifications$: Observable<AppNotification[]>;
  unreadCount$: Observable<number>;
  showNotifications = false;
  bellWiggle = false;

  private prevUnread = 0;
  private unreadSub?: Subscription;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.notifications$ = this.notificationService.getNotifications();
    this.unreadCount$ = this.notificationService.getUnreadCount();
  }

  ngOnInit(): void {
    // Trigger wiggle only when unread count increases
    this.unreadSub = this.notificationService.getUnreadCount().subscribe(count => {
      if (count > this.prevUnread) {
        this.bellWiggle = false;
        setTimeout(() => {
          this.bellWiggle = true;
          setTimeout(() => (this.bellWiggle = false), 600);
        }, 10);
      }
      this.prevUnread = count;
    });
  }

  ngOnDestroy(): void {
    this.unreadSub?.unsubscribe();
  }

  logout() {
    this.authService.logout();
    this.showNotifications = false;
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(id: number) {
    this.notificationService.markAsRead(id);
  }

  markAllRead() {
    this.notificationService.markAllRead();
  }
}

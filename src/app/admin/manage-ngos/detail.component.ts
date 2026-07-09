import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgoService } from '../../services/ngo.service';
import { RegistrationService } from '../../services/registration.service';
import { NotificationService } from '../../services/notification.service';
import { ToastService } from '../../shared/toast.service';
import { Ngo } from '../../models/ngo';
import { Registration } from '../../models/registration';
import { Observable, combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-manage-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {
  ngoId: number = 0;
  ngo$: Observable<Ngo | undefined>;
  registrations$: Observable<Registration[]>;
  
  notificationEmployee: string | null = null;
  notificationMessage = '';
  
  editingRegId: number | null = null;
  editingRegName = '';

  constructor(
    private route: ActivatedRoute,
    private ngoService: NgoService,
    private registrationService: RegistrationService,
    private notificationService: NotificationService,
    private toastService: ToastService
  ) {
    this.ngoId = parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);
    this.ngo$ = this.ngoService.getNgos().pipe(
      map(ngos => ngos.find(n => n.id === this.ngoId))
    );
    this.registrations$ = this.registrationService.getRegistrations().pipe(
      map(regs => regs.filter(r => r.ngoId === this.ngoId))
    );
  }

  ngOnInit(): void {}

  openNotification(employeeName: string) {
    this.notificationEmployee = employeeName;
    this.notificationMessage = '';
  }

  closeNotification() {
    this.notificationEmployee = null;
  }

  sendNotification() {
    if (!this.notificationMessage.trim()) return;
    this.notificationService.addNotification({
      id: 0,
      message: `Message from Admin: ${this.notificationMessage}`,
      type: 'reminder',
      timestamp: new Date().toISOString(),
      read: false,
      recipientUsername: this.notificationEmployee || undefined
    } as any);
    this.toastService.show(`Notification sent to ${this.notificationEmployee}`, 'success');
    this.closeNotification();
  }

  removeRegistration(reg: Registration) {
    if (confirm(`Remove ${reg.employeeName} from this activity?`)) {
      this.registrationService.cancelRegistration(reg.id);
      this.toastService.show(`Removed ${reg.employeeName}`, 'success');
    }
  }

  startEdit(reg: Registration) {
    this.editingRegId = reg.id;
    this.editingRegName = reg.employeeName;
  }

  saveEdit(reg: Registration) {
    reg.employeeName = this.editingRegName;
    this.toastService.show(`Updated registration details`, 'success');
    this.editingRegId = null;
  }

  cancelEdit() {
    this.editingRegId = null;
  }
}

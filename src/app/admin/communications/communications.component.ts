import { Component, OnInit } from '@angular/core';
import { NgoService } from '../../services/ngo.service';
import { NotificationService, ScheduledMessage } from '../../services/notification.service';
import { RegistrationService } from '../../services/registration.service';
import { ToastService } from '../../shared/toast.service';
import { Ngo } from '../../models/ngo';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-communications',
  templateUrl: './communications.component.html',
  styleUrls: ['./communications.component.css']
})
export class CommunicationsComponent implements OnInit {
  ngos$: Observable<Ngo[]>;
  scheduledMessages$: Observable<ScheduledMessage[]>;

  recipientScope: 'all' | 'ngo' = 'all';
  targetNgoId: number | null = null;
  message = '';
  timing: 'immediate' | '1week' | '3days' | '1day' = 'immediate';

  constructor(
    private ngoService: NgoService,
    private notificationService: NotificationService,
    private registrationService: RegistrationService,
    private toastService: ToastService
  ) {
    this.ngos$ = this.ngoService.getNgos();
    this.scheduledMessages$ = this.notificationService.getScheduledMessages();
  }

  ngOnInit(): void {}

  sendMessage() {
    if (!this.message.trim()) {
      this.toastService.show('Message is required.', 'error');
      return;
    }
    if (this.recipientScope === 'ngo' && !this.targetNgoId) {
      this.toastService.show('Please select an NGO.', 'error');
      return;
    }

    if (this.timing === 'immediate') {
      if (this.recipientScope === 'all') {
        this.notificationService.addBroadcast(this.message);
      } else if (this.targetNgoId) {
        this.registrationService.getRegistrations().subscribe(regs => {
          const ngoRegs = regs.filter(r => r.ngoId == this.targetNgoId);
          ngoRegs.forEach(reg => {
            this.notificationService.addNotification({
              id: 0,
              message: `Message for Activity Volunteers: ${this.message}`,
              type: 'broadcast',
              timestamp: new Date().toISOString(),
              read: false,
              recipientUsername: reg.employeeName
            } as any);
          });
        }).unsubscribe();
      }
      this.toastService.show('Message sent immediately.', 'success');
      this.message = '';
      return;
    }

    if (this.recipientScope !== 'ngo' || !this.targetNgoId) {
       this.toastService.show('Scheduled messages must target a specific NGO.', 'error');
       return;
    }

    this.ngoService.getNgos().subscribe(ngos => {
      const ngo = ngos.find(n => n.id == this.targetNgoId);
      if (!ngo) return;

      const eventDate = new Date(ngo.date);
      let triggerDate = new Date(eventDate);
      if (this.timing === '1week') triggerDate.setDate(triggerDate.getDate() - 7);
      if (this.timing === '3days') triggerDate.setDate(triggerDate.getDate() - 3);
      if (this.timing === '1day') triggerDate.setDate(triggerDate.getDate() - 1);
      
      this.registrationService.getRegistrations().subscribe(regs => {
        const ngoRegs = regs.filter(r => r.ngoId == this.targetNgoId);
        ngoRegs.forEach(reg => {
          this.notificationService.addScheduledMessage({
             message: `Scheduled Message: ${this.message}`,
             recipientUsername: reg.employeeName,
             targetNgoId: this.targetNgoId!,
             triggerDate: triggerDate
          });
        });
        this.toastService.show(`Scheduled messages for ${ngoRegs.length} volunteers.`, 'success');
        this.message = '';
      }).unsubscribe();

    }).unsubscribe();
  }

  deleteMessage(id: number) {
    this.notificationService.deleteScheduledMessage(id);
    this.toastService.show('Message removed from schedule.', 'success');
  }
}

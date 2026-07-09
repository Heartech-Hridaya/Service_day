import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Ngo } from '../../models/ngo';
import { NgoService } from '../../services/ngo.service';
import { ToastService } from '../../shared/toast.service';
import { Observable } from 'rxjs';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import QRCode from 'qrcode';

@Component({
  selector: 'app-manage-ngos',
  templateUrl: './manage-ngos.component.html',
  styleUrls: ['./manage-ngos.component.css'],
  animations: [
    trigger('tableAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(-20px)' }),
          stagger('50ms', [
            animate('300ms ease-in-out', style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true }),
        query(':leave', [
          animate('300ms ease-in-out', style({ opacity: 0, transform: 'translateX(20px)' }))
        ], { optional: true })
      ])
    ])
  ]
})
export class ManageNgosComponent implements OnInit {
  ngos$: Observable<Ngo[]>;
  editingNgoId: number | null = null;
  editingNgoCopy: Ngo | null = null;
  newNgo: Partial<Ngo> = this.resetNewNgo();

  qrNgoId: number | null = null;
  qrDataUrl: string | null = null;

  constructor(
    private ngoService: NgoService,
    private toastService: ToastService
  ) {
    this.ngos$ = this.ngoService.getNgos();
  }

  ngOnInit(): void {}

  resetNewNgo(): Partial<Ngo> {
    return { name: '', description: '', date: '', serviceTime: '', location: '', maxSlots: 0, slotsTaken: 0, cutoffDateTime: '' };
  }

  addNgo() {
    if (this.newNgo.name) {
      this.ngoService.addNgo(this.newNgo as Ngo);
      this.toastService.show(`Added new activity: ${this.newNgo.name}`, 'success');
      this.newNgo = this.resetNewNgo();
    }
  }

  editNgo(ngo: Ngo) {
    this.editingNgoId = ngo.id;
    this.editingNgoCopy = { ...ngo };
  }

  saveNgo() {
    if (!this.editingNgoCopy) return;
    this.ngoService.updateNgo(this.editingNgoCopy);
    this.toastService.show(`Updated activity: ${this.editingNgoCopy.name}`, 'success');
    this.editingNgoId = null;
    this.editingNgoCopy = null;
  }

  cancelEdit() {
    this.editingNgoId = null;
    this.editingNgoCopy = null;
  }

  deleteNgo(id: number) {
    this.ngoService.deleteNgo(id);
    this.toastService.show('Activity deleted.', 'success');
    if (this.qrNgoId === id) {
      this.qrNgoId = null;
      this.qrDataUrl = null;
    }
  }

  async generateQr(ngo: Ngo) {
    if (this.qrNgoId === ngo.id) {
      this.closeQr();
      return;
    }
    const payload = JSON.stringify({ ngoId: ngo.id });
    try {
      this.qrDataUrl = await QRCode.toDataURL(payload, { width: 200, margin: 2 });
      this.qrNgoId = ngo.id;
    } catch (e) {
      this.toastService.show('Failed to generate QR code.', 'error');
    }
  }

  closeQr() {
    this.qrNgoId = null;
    this.qrDataUrl = null;
  }
}

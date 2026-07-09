import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgoService } from '../../services/ngo.service';
import { Ngo } from '../../models/ngo';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-manage-form',
  templateUrl: './manage-form.component.html',
  styleUrls: ['./manage-form.component.css']
})
export class ManageFormComponent implements OnInit {
  ngo: Partial<Ngo> = { maxSlots: 0, slotsTaken: 0 };
  isEdit = false;
  imagePreview: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ngoService: NgoService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      const id = parseInt(idParam, 10);
      this.ngoService.getNgos().subscribe(ngos => {
        const found = ngos.find(n => n.id === id);
        if (found) {
          this.ngo = { ...found };
          this.imagePreview = this.ngo.imageUrl || null;
        }
      });
    }
  }

  onImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        this.ngo.imageUrl = dataUrl;
        this.imagePreview = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  }

  saveNgo() {
    if (!this.ngo.name || !this.ngo.date || !this.ngo.serviceTime) {
      this.toastService.show('Please fill required fields.', 'error');
      return;
    }

    if (this.isEdit) {
      this.ngoService.updateNgo(this.ngo as Ngo);
      this.toastService.show(`Updated activity: ${this.ngo.name}`, 'success');
    } else {
      this.ngoService.addNgo(this.ngo as Ngo);
      this.toastService.show(`Added new activity: ${this.ngo.name}`, 'success');
    }
    this.router.navigate(['/admin/manage']);
  }

  cancel() {
    this.router.navigate(['/admin/manage']);
  }
}

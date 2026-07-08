import { Component, OnInit } from '@angular/core';
import { Ngo } from '../../models/ngo';
import { NgoService } from '../../services/ngo.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-manage-ngos',
  templateUrl: './manage-ngos.component.html',
  styleUrls: ['./manage-ngos.component.css']
})
export class ManageNgosComponent implements OnInit {
  ngos$: Observable<Ngo[]>;
  editingNgoId: number | null = null;
  newNgo: Partial<Ngo> = this.resetNewNgo();

  constructor(private ngoService: NgoService) {
    this.ngos$ = this.ngoService.getNgos();
  }

  ngOnInit(): void {}

  resetNewNgo(): Partial<Ngo> {
    return { name: '', description: '', date: '', location: '', maxSlots: 0, slotsTaken: 0, cutoffDateTime: '' };
  }

  addNgo() {
    if (this.newNgo.name) {
      this.ngoService.addNgo(this.newNgo as Ngo);
      this.newNgo = this.resetNewNgo();
    }
  }

  editNgo(ngo: Ngo) {
    this.editingNgoId = ngo.id;
  }

  saveNgo(ngo: Ngo) {
    this.ngoService.updateNgo(ngo);
    this.editingNgoId = null;
  }

  cancelEdit() {
    this.editingNgoId = null;
  }

  deleteNgo(id: number) {
    if (confirm('Are you sure you want to delete this NGO?')) {
      this.ngoService.deleteNgo(id);
    }
  }
}

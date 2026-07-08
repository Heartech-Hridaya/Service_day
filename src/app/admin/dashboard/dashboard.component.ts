import { Component, OnInit } from '@angular/core';
import { NgoService } from '../../services/ngo.service';
import { Ngo } from '../../models/ngo';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  ngos$: Observable<Ngo[]>;

  constructor(private ngoService: NgoService) {
    this.ngos$ = this.ngoService.getNgos();
  }

  ngOnInit(): void {}

  sendReminder(ngo: Ngo) {
    alert(`Mock Notification: Reminder sent to volunteers for ${ngo.name}`);
  }
}

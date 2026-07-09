import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { ManageNgosComponent } from './manage-ngos/manage-ngos.component';
import { ManageFormComponent } from './manage-ngos/manage-form.component';
import { DetailComponent } from './manage-ngos/detail.component';
import { CommunicationsComponent } from './communications/communications.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    ManageNgosComponent,
    ManageFormComponent,
    DetailComponent,
    CommunicationsComponent,
    AttendanceComponent,
    DashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    AdminRoutingModule,
    NgChartsModule
  ]
})
export class AdminModule { }

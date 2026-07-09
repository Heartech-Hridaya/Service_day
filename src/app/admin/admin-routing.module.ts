import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ManageNgosComponent } from './manage-ngos/manage-ngos.component';
import { ManageFormComponent } from './manage-ngos/manage-form.component';
import { DetailComponent } from './manage-ngos/detail.component';
import { CommunicationsComponent } from './communications/communications.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  { path: 'manage', component: ManageNgosComponent },
  { path: 'manage/new', component: ManageFormComponent },
  { path: 'manage/edit/:id', component: ManageFormComponent },
  { path: 'manage/:id', component: DetailComponent },
  { path: 'communications', component: CommunicationsComponent },
  { path: 'attendance', component: AttendanceComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }

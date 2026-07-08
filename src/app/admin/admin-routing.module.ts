import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ManageNgosComponent } from './manage-ngos/manage-ngos.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  { path: 'manage', component: ManageNgosComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '', redirectTo: 'manage', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }

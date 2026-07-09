import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NgoListComponent } from './ngo-list/ngo-list.component';
import { MyRegistrationsComponent } from './my-registrations/my-registrations.component';
import { CheckInComponent } from './check-in/check-in.component';
import { ProfileComponent } from './profile/profile.component';
import { NotificationsComponent } from './notifications/notifications.component';

const routes: Routes = [
  { path: 'list',              component: NgoListComponent },
  { path: 'my-registrations', component: MyRegistrationsComponent },
  { path: 'check-in',         component: CheckInComponent },
  { path: 'profile',          component: ProfileComponent },
  { path: 'notifications',    component: NotificationsComponent },
  { path: '',                  redirectTo: 'list', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { }

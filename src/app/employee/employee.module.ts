import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EmployeeRoutingModule } from './employee-routing.module';
import { NgoListComponent } from './ngo-list/ngo-list.component';
import { MyRegistrationsComponent } from './my-registrations/my-registrations.component';
import { CheckInComponent } from './check-in/check-in.component';
import { ProfileComponent } from './profile/profile.component';
import { NotificationsComponent } from './notifications/notifications.component';

@NgModule({
  declarations: [
    NgoListComponent,
    MyRegistrationsComponent,
    CheckInComponent,
    ProfileComponent,
    NotificationsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    EmployeeRoutingModule
  ]
})
export class EmployeeModule { }

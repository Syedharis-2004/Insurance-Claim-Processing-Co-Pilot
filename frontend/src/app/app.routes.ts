import { Routes } from '@angular/router';
import { UserDashboard } from './user-dashboard/user-dashboard';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';

export const routes: Routes = [
  { path: '', redirectTo: 'user', pathMatch: 'full' },
  { path: 'user', component: UserDashboard },
  { path: 'admin', component: AdminDashboard },
];

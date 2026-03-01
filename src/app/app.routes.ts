import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { EmployeeDashboard } from './pages/employee-dashboard/employee-dashboard';
import { ManagerDashboard } from './pages/manager-dashboard/manager-dashboard';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { Signup } from './pages/signup/signup';
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  {
    path: 'employee-dashboard',
    component: EmployeeDashboard,
    // canActivate: [AuthGuard, RoleGuard],
    data: { role: 'employee' },
  },
  {
    path: 'manager-dashboard',
    component: ManagerDashboard,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'manager' },
  },
];


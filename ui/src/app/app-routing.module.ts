import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

import { DashboardService } from './services/guard/dashboard.service';
import { LoginService } from './services/guard/login.service';

const routes: Routes = [
    { path: 'login', component: LoginComponent, canActivate: [LoginService] },
    { path: 'dashboard', component: DashboardComponent, canActivate: [DashboardService] },
    { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule]
})
export class AppRoutingModule { }

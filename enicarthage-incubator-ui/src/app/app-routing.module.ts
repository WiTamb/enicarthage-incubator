import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SubmitProjectComponent } from './submit-project/submit-project.component';
import { ProjectsComponent } from './projects/projects.component';
import { EventsComponent } from './events/events.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'submit-project', component: SubmitProjectComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'events', component: EventsComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

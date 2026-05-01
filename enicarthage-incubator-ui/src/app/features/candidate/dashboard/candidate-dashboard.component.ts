import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectService } from '../../../core/services/project.service';
import { Project, ProjectStatus } from '../../../core/models/project.model';

@Component({
  selector: 'app-candidate-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Welcome -->
    <div class="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 p-8 mb-8 text-white">
      <h1 class="text-2xl font-bold font-display">Bienvenue, {{ auth.currentUser()?.firstName }} 👋</h1>
      <p class="text-primary-100 mt-1">Voici un résumé de votre activité.</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="stat-card">
        <div class="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
        </div>
        <div>
          <p class="text-2xl font-bold text-text-primary">{{ projects.length }}</p>
          <p class="text-sm text-text-secondary">Total projets</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="w-12 h-12 rounded-2xl bg-warning-50 flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div>
          <p class="text-2xl font-bold text-text-primary">{{ countByStatus('SUBMITTED') + countByStatus('UNDER_REVIEW') }}</p>
          <p class="text-sm text-text-secondary">En attente</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="w-12 h-12 rounded-2xl bg-success-50 flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div>
          <p class="text-2xl font-bold text-text-primary">{{ countByStatus('ACCEPTED') }}</p>
          <p class="text-sm text-text-secondary">Acceptés</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="w-12 h-12 rounded-2xl bg-danger-50 flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div>
          <p class="text-2xl font-bold text-text-primary">{{ countByStatus('REJECTED') }}</p>
          <p class="text-sm text-text-secondary">Rejetés</p>
        </div>
      </div>
    </div>

    <!-- Projects & Action -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="page-title">Mes Projets</h2>
      <a routerLink="/candidate/projects/new" class="btn-primary btn-sm">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
        Nouveau projet
      </a>
    </div>

    @if (projects.length === 0) {
      <div class="card p-12 text-center">
        <svg class="w-16 h-16 text-slate-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
        <p class="text-text-secondary mb-4">Vous n'avez pas encore soumis de projet.</p>
        <a routerLink="/candidate/projects/new" class="btn-primary btn-sm">Soumettre mon premier projet</a>
      </div>
    } @else {
      <div class="table-container">
        <table class="w-full">
          <thead>
            <tr class="table-header">
              <th class="px-6 py-4">Titre</th>
              <th class="px-6 py-4">Programme</th>
              <th class="px-6 py-4">Statut</th>
              <th class="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody>
            @for (p of projects; track p.id) {
              <tr class="table-row">
                <td class="px-6 py-4 font-medium text-text-primary">{{ p.title }}</td>
                <td class="px-6 py-4 text-sm text-text-secondary">{{ p.program?.name || '—' }}</td>
                <td class="px-6 py-4">
                  <span [class]="statusBadge(p.status)">{{ statusLabel(p.status) }}</span>
                </td>
                <td class="px-6 py-4 text-sm text-text-muted">{{ p.submittedAt | date:'dd/MM/yyyy' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `
})
export class CandidateDashboardComponent implements OnInit {
  projects: Project[] = [];
  constructor(public auth: AuthService, private projectService: ProjectService) {}
  ngOnInit() {
    this.projectService.getMyProjects().subscribe(r => { if (r.success) this.projects = r.data || []; });
  }
  countByStatus(s: string) { return this.projects.filter(p => p.status === s).length; }
  statusBadge(s: ProjectStatus) {
    const m: Record<string, string> = { SUBMITTED: 'badge-primary', UNDER_REVIEW: 'badge-warning', ACCEPTED: 'badge-success', REJECTED: 'badge-danger' };
    return m[s] || 'badge-slate';
  }
  statusLabel(s: ProjectStatus) {
    const m: Record<string, string> = { SUBMITTED: 'Soumis', UNDER_REVIEW: 'En revue', ACCEPTED: 'Accepté', REJECTED: 'Rejeté' };
    return m[s] || s;
  }
}

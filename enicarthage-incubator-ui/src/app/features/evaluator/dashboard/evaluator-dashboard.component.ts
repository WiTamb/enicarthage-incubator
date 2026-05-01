import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../../core/services/project.service';
import { Project, ProjectStatus } from '../../../core/models/project.model';

@Component({
  selector: 'app-evaluator-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1 class="page-title mb-2">Tableau de bord</h1>
    <p class="page-subtitle mb-8">Projets en attente d'évaluation.</p>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      <div class="stat-card">
        <div class="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        </div>
        <div><p class="text-2xl font-bold">{{ projects.length }}</p><p class="text-sm text-text-secondary">Total projets</p></div>
      </div>
      <div class="stat-card">
        <div class="w-12 h-12 rounded-2xl bg-warning-50 flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div><p class="text-2xl font-bold">{{ countStatus('UNDER_REVIEW') }}</p><p class="text-sm text-text-secondary">En revue</p></div>
      </div>
      <div class="stat-card">
        <div class="w-12 h-12 rounded-2xl bg-success-50 flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div><p class="text-2xl font-bold">{{ countStatus('ACCEPTED') }}</p><p class="text-sm text-text-secondary">Acceptés</p></div>
      </div>
    </div>

    <h2 class="text-lg font-semibold mb-4">Projets récents</h2>
    <div class="table-container">
      <table class="w-full">
        <thead><tr class="table-header">
          <th class="px-6 py-4">Titre</th><th class="px-6 py-4">Candidat</th><th class="px-6 py-4">Statut</th><th class="px-6 py-4">Date</th>
        </tr></thead>
        <tbody>
          @for (p of projects; track p.id) {
            <tr class="table-row cursor-pointer" (click)="selected = p">
              <td class="px-6 py-4 font-medium">{{ p.title }}</td>
              <td class="px-6 py-4 text-sm text-text-secondary">{{ p.owner?.firstName }} {{ p.owner?.lastName }}</td>
              <td class="px-6 py-4"><span [class]="badge(p.status)">{{ label(p.status) }}</span></td>
              <td class="px-6 py-4 text-sm text-text-muted">{{ p.submittedAt | date:'dd/MM/yyyy' }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <!-- Detail slide-over -->
    @if (selected) {
      <div class="overlay" (click)="selected = null"></div>
      <div class="slide-over p-8">
        <div class="flex justify-between items-start mb-6">
          <h2 class="text-xl font-bold">{{ selected.title }}</h2>
          <button (click)="selected = null" class="text-text-muted hover:text-text-primary">✕</button>
        </div>
        <p class="text-sm text-text-secondary mb-4">{{ selected.description }}</p>
        <div class="text-sm space-y-2 mb-6">
          <p><span class="text-text-muted">Candidat:</span> {{ selected.owner?.firstName }} {{ selected.owner?.lastName }}</p>
          <p><span class="text-text-muted">Domaine:</span> {{ selected.domain || '—' }}</p>
          <p><span class="text-text-muted">Programme:</span> {{ selected.program?.name || '—' }}</p>
          <p><span class="text-text-muted">Statut:</span> <span [class]="badge(selected.status)">{{ label(selected.status) }}</span></p>
        </div>
      </div>
    }
  `
})
export class EvaluatorDashboardComponent implements OnInit {
  projects: Project[] = [];
  selected: Project | null = null;
  constructor(private projectService: ProjectService) {}
  ngOnInit() { this.projectService.getAllProjects().subscribe(r => { if (r.success) this.projects = r.data || []; }); }
  countStatus(s: string) { return this.projects.filter(p => p.status === s).length; }
  badge(s: ProjectStatus) { const m: Record<string, string> = { SUBMITTED: 'badge-primary', UNDER_REVIEW: 'badge-warning', ACCEPTED: 'badge-success', REJECTED: 'badge-danger' }; return m[s] || 'badge-slate'; }
  label(s: ProjectStatus) { const m: Record<string, string> = { SUBMITTED: 'Soumis', UNDER_REVIEW: 'En revue', ACCEPTED: 'Accepté', REJECTED: 'Rejeté' }; return m[s] || s; }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { Project, ProjectStatus } from '../../../core/models/project.model';

@Component({
  selector: 'app-admin-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center justify-between mb-8">
      <div><h1 class="page-title">Projets</h1><p class="page-subtitle">Gérez tous les projets soumis.</p></div>
      <div class="flex gap-2">
        @for (s of statuses; track s.v) {
          <button (click)="filter = filter === s.v ? null : s.v" class="btn-sm" [class]="filter === s.v ? 'btn-primary' : 'btn-ghost'">{{ s.l }}</button>
        }
      </div>
    </div>

    <!-- Kanban -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      @for (col of columns; track col.status) {
        <div>
          <div class="flex items-center gap-2 mb-4">
            <div class="w-3 h-3 rounded-full" [class]="col.dot"></div>
            <h3 class="text-sm font-semibold text-text-secondary">{{ col.label }}</h3>
            <span class="badge-slate text-xs">{{ colProjects(col.status).length }}</span>
          </div>
          <div class="space-y-3">
            @for (p of colProjects(col.status); track p.id) {
              <div class="card p-4 cursor-pointer" (click)="selected = p">
                <h4 class="font-medium text-sm mb-1">{{ p.title }}</h4>
                <p class="text-xs text-text-muted mb-2">{{ p.owner.firstName }} {{ p.owner.lastName }}</p>
                <p class="text-xs text-text-muted">{{ p.submittedAt | date:'dd/MM' }}</p>
              </div>
            }
          </div>
        </div>
      }
    </div>

    <!-- Detail -->
    @if (selected) {
      <div class="overlay" (click)="selected = null"></div>
      <div class="slide-over p-8">
        <div class="flex justify-between items-start mb-6">
          <h2 class="text-xl font-bold">{{ selected.title }}</h2>
          <button (click)="selected = null" class="text-text-muted hover:text-text-primary text-xl">✕</button>
        </div>
        <p class="text-sm text-text-secondary mb-4">{{ selected.description }}</p>
        <div class="text-sm space-y-2 mb-6">
          <p><span class="text-text-muted">Candidat:</span> {{ selected.owner.firstName }} {{ selected.owner.lastName }}</p>
          <p><span class="text-text-muted">Domaine:</span> {{ selected.domain || '—' }}</p>
          <p><span class="text-text-muted">Programme:</span> {{ selected.program?.name || '—' }}</p>
        </div>
        <div class="form-group">
          <label class="label">Changer le statut</label>
          <select class="input" [(ngModel)]="newStatus">
            <option value="SUBMITTED">Soumis</option>
            <option value="UNDER_REVIEW">En revue</option>
            <option value="ACCEPTED">Accepté</option>
            <option value="REJECTED">Rejeté</option>
          </select>
        </div>
        <button (click)="updateStatus()" class="btn-primary btn-sm mt-4">Appliquer</button>
      </div>
    }
  `
})
export class AdminProjectsComponent implements OnInit {
  projects: Project[] = [];
  selected: Project | null = null;
  newStatus: ProjectStatus = ProjectStatus.SUBMITTED;
  filter: ProjectStatus | null = null;
  statuses = [
    { v: ProjectStatus.SUBMITTED, l: 'Soumis' },
    { v: ProjectStatus.UNDER_REVIEW, l: 'En revue' },
    { v: ProjectStatus.ACCEPTED, l: 'Acceptés' },
    { v: ProjectStatus.REJECTED, l: 'Rejetés' }
  ];
  columns = [
    { status: ProjectStatus.SUBMITTED, label: 'Soumis', dot: 'bg-primary-500' },
    { status: ProjectStatus.UNDER_REVIEW, label: 'En revue', dot: 'bg-warning-500' },
    { status: ProjectStatus.ACCEPTED, label: 'Acceptés', dot: 'bg-success-500' },
    { status: ProjectStatus.REJECTED, label: 'Rejetés', dot: 'bg-danger-500' }
  ];

  constructor(private projectService: ProjectService) {}
  ngOnInit() { this.load(); }
  load() { this.projectService.getAllProjects().subscribe(r => { if (r.success) this.projects = r.data || []; }); }
  colProjects(s: ProjectStatus) { return this.projects.filter(p => p.status === s); }
  updateStatus() {
    if (!this.selected) return;
    this.projectService.updateStatus(this.selected.id, this.newStatus).subscribe(() => { this.selected = null; this.load(); });
  }
}


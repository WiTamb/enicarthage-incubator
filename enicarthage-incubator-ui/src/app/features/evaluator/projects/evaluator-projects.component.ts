import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { EvaluationService } from '../../../core/services/evaluation.service';
import { Project, ProjectStatus } from '../../../core/models/project.model';
import { EvaluationRequest } from '../../../core/models/index';

@Component({
  selector: 'app-evaluator-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="page-title mb-2">Projets à évaluer</h1>
    <p class="page-subtitle mb-8">Évaluez et notez les projets soumis.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      @for (p of projects; track p.id) {
        <div class="card p-6 cursor-pointer" (click)="openEval(p)">
          <div class="flex items-start justify-between mb-3">
            <h3 class="font-semibold text-text-primary">{{ p.title }}</h3>
            <span [class]="badge(p.status)">{{ label(p.status) }}</span>
          </div>
          <p class="text-sm text-text-secondary line-clamp-2 mb-3">{{ p.description }}</p>
          <p class="text-xs text-text-muted">{{ p.owner?.firstName }} {{ p.owner?.lastName }} · {{ p.submittedAt | date:'dd/MM/yyyy' }}</p>
        </div>
      }
    </div>

    @if (evalProject) {
      <div class="overlay" (click)="evalProject = null"></div>
      <div class="slide-over p-8">
        <div class="flex justify-between items-start mb-6">
          <h2 class="text-xl font-bold">Évaluer: {{ evalProject.title }}</h2>
          <button (click)="evalProject = null" class="text-text-muted hover:text-text-primary text-xl">✕</button>
        </div>
        <p class="text-sm text-text-secondary mb-6">{{ evalProject.description }}</p>
        <form (ngSubmit)="submitEval()" class="space-y-5">
          <div class="form-group">
            <label class="label">Score (0-100)</label>
            <input type="number" class="input" [(ngModel)]="evalForm.score" name="score" min="0" max="100" required>
          </div>
          <div class="form-group">
            <label class="label">Commentaire *</label>
            <textarea class="input min-h-[100px]" [(ngModel)]="evalForm.comment" name="comment" required></textarea>
          </div>
          <div class="form-group">
            <label class="label">Recommandation</label>
            <select class="input" [(ngModel)]="evalForm.recommendation" name="rec">
              <option value="">Aucune</option>
              <option value="ACCEPT">Accepter</option>
              <option value="REJECT">Rejeter</option>
              <option value="REVISE">Réviser</option>
            </select>
          </div>
          <button type="submit" class="btn-primary btn-md w-full" [disabled]="evalLoading">
            @if (evalLoading) { <span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> }
            Soumettre l'évaluation
          </button>
          @if (evalMsg) { <p class="text-sm text-success-600">{{ evalMsg }}</p> }
        </form>
      </div>
    }
  `
})
export class EvaluatorProjectsComponent implements OnInit {
  projects: Project[] = [];
  evalProject: Project | null = null;
  evalForm: EvaluationRequest = { projectId: 0, score: 0, comment: '' };
  evalLoading = false; evalMsg = '';

  constructor(private projectService: ProjectService, private evalService: EvaluationService) {}
  ngOnInit() { this.projectService.getAllProjects().subscribe(r => { if (r.success) this.projects = r.data || []; }); }

  openEval(p: Project) {
    this.evalProject = p;
    this.evalForm = { projectId: p.id, score: 0, comment: '', recommendation: '' };
    this.evalMsg = '';
  }

  submitEval() {
    this.evalLoading = true;
    this.evalService.evaluate(this.evalForm).subscribe({
      next: () => { this.evalLoading = false; this.evalMsg = 'Évaluation enregistrée !'; },
      error: () => { this.evalLoading = false; }
    });
  }

  badge(s: ProjectStatus) { return ({ SUBMITTED: 'badge-primary', UNDER_REVIEW: 'badge-warning', ACCEPTED: 'badge-success', REJECTED: 'badge-danger' } as Record<string,string>)[s] || 'badge-slate'; }
  label(s: ProjectStatus) { return ({ SUBMITTED: 'Soumis', UNDER_REVIEW: 'En revue', ACCEPTED: 'Accepté', REJECTED: 'Rejeté' } as Record<string,string>)[s] || s; }
}

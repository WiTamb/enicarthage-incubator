import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { EvaluationService } from '../../../core/services/evaluation.service';
import { Project, ProjectStatus } from '../../../core/models/project.model';

@Component({
  selector: 'app-evaluator-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <h1 class="page-title mb-2">Projets à évaluer</h1>
    <p class="page-subtitle mb-8">Projets soumis dans vos rounds assignés. Cliquez pour évaluer.</p>

    @if (projects.length === 0) {
      <div class="card p-12 text-center">
        <svg class="w-16 h-16 text-slate-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        <p class="text-text-secondary mb-2">Aucun projet à évaluer pour le moment.</p>
        <p class="text-xs text-text-muted">Les projets apparaîtront ici quand les candidats les soumettront dans vos rounds.</p>
      </div>
    } @else {
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (p of projects; track p.id) {
          <div class="card overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer" (click)="openEval(p)">
            <div class="h-1 bg-gradient-to-r" [class]="p.status === 'SUBMITTED' ? 'from-primary-400 to-primary-500' : p.status === 'ACCEPTED' ? 'from-success-400 to-success-500' : 'from-slate-300 to-slate-400'"></div>
            <div class="p-6">
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-semibold text-text-primary group-hover:text-primary-600 transition-colors">{{ p.title }}</h3>
                <span [class]="badge(p.status)">{{ label(p.status) }}</span>
              </div>
              <p class="text-sm text-text-secondary line-clamp-2 mb-4">{{ p.description }}</p>
              
              <div class="flex items-center gap-3 text-xs text-text-muted">
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  {{ p.owner?.firstName }} {{ p.owner?.lastName }}
                </span>
                <span>{{ p.submittedAt | date:'dd/MM/yyyy' }}</span>
              </div>

              @if (p.domain) {
                <div class="mt-3"><span class="text-[10px] px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 font-medium">{{ p.domain }}</span></div>
              }

              <!-- Show existing evaluations count -->
              @if (p.evaluations?.length) {
                <div class="mt-3 pt-3 border-t border-slate-50 flex items-center gap-2">
                  <span class="text-[10px] text-success-600 font-bold">✓ {{ p.evaluations.length }} évaluation(s)</span>
                  <span class="text-[10px] text-text-muted">Moy: {{ avgScore(p) }}/100</span>
                </div>
              }
            </div>
          </div>
        }
      </div>
    }

    <!-- Evaluation slide-over -->
    @if (evalProject) {
      <div class="overlay" (click)="evalProject = null"></div>
      <div class="slide-over p-8 w-full max-w-lg overflow-y-auto">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h2 class="text-xl font-bold text-text-primary">{{ evalProject.title }}</h2>
            <p class="text-xs text-text-muted mt-1">par {{ evalProject.owner?.firstName }} {{ evalProject.owner?.lastName }}</p>
          </div>
          <button (click)="evalProject = null" class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-text-muted">✕</button>
        </div>

        <!-- Project details -->
        <div class="space-y-4 mb-8">
          <div class="p-4 bg-slate-50 rounded-xl">
            <h4 class="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Description</h4>
            <p class="text-sm text-text-secondary">{{ evalProject.description }}</p>
          </div>
          @if (evalProject.domain) {
            <div class="flex gap-4 text-xs">
              <span class="text-text-muted">Domaine:</span>
              <span class="font-medium text-text-primary">{{ evalProject.domain }}</span>
            </div>
          }
          @if (evalProject.videoUrl) {
            <a [href]="evalProject.videoUrl" target="_blank" class="text-xs text-primary-600 hover:underline flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Voir le pitch vidéo
            </a>
          }
          @if (evalProject.githubUrl) {
            <a [href]="evalProject.githubUrl" target="_blank" class="text-xs text-primary-600 hover:underline flex items-center gap-1">
              📦 Repository GitHub
            </a>
          }
        </div>

        <!-- Previous evaluations -->
        @if (evalProject.evaluations?.length) {
          <div class="mb-8">
            <h4 class="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3">Évaluations précédentes</h4>
            <div class="space-y-2">
              @for (ev of evalProject.evaluations; track ev.id) {
                <div class="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div class="flex justify-between mb-1">
                    <span class="text-xs font-medium">{{ ev.evaluator?.firstName || 'Évaluateur' }}</span>
                    <span class="text-sm font-bold text-primary-600">{{ ev.score }}/100</span>
                  </div>
                  <p class="text-xs text-text-secondary italic">"{{ ev.comment }}"</p>
                </div>
              }
            </div>
          </div>
        }

        <!-- Eval form -->
        <div class="p-5 bg-amber-50 rounded-2xl border border-amber-100">
          <h4 class="text-xs font-bold text-amber-700 uppercase tracking-wider mb-4">Votre évaluation</h4>
          <form (ngSubmit)="submitEval()" class="space-y-4">
            <div class="form-group">
              <label class="label">Score (0-100)</label>
              <input type="number" class="input bg-white" [(ngModel)]="evalForm.score" name="score" min="0" max="100" required>
            </div>
            <div class="form-group">
              <label class="label">Commentaire *</label>
              <textarea class="input bg-white min-h-[100px]" [(ngModel)]="evalForm.comment" name="comment" required placeholder="Votre analyse du projet..."></textarea>
            </div>
            <div class="form-group">
              <label class="label">Recommandation</label>
              <select class="input bg-white" [(ngModel)]="evalForm.recommendation" name="rec">
                <option value="">Aucune</option>
                <option value="ACCEPT">Accepter / Avancer</option>
                <option value="REVISE">Demander des révisions</option>
                <option value="REJECT">Rejeter / Éliminer</option>
              </select>
            </div>
            <button type="submit" class="btn-primary btn-md w-full shadow-lg bg-amber-500 hover:bg-amber-600 border-none" [disabled]="evalLoading">
              {{ evalLoading ? 'Envoi...' : 'Soumettre l\'évaluation' }}
            </button>
            @if (evalMsg) {
              <p class="text-sm text-success-600 text-center font-medium">{{ evalMsg }}</p>
            }
          </form>
        </div>
      </div>
    }
  `
})
export class EvaluatorProjectsComponent implements OnInit {
  projects: Project[] = [];
  evalProject: Project | null = null;
  evalForm = { projectId: 0, score: 0, comment: '', recommendation: '' };
  evalLoading = false;
  evalMsg = '';

  constructor(private projectService: ProjectService, private evalService: EvaluationService) {}

  ngOnInit() {
    this.projectService.getAllProjects().subscribe(r => {
      if (r.success) this.projects = r.data || [];
    });
  }

  openEval(p: Project) {
    this.evalProject = p;
    this.evalForm = { projectId: p.id, score: 0, comment: '', recommendation: '' };
    this.evalMsg = '';
  }

  submitEval() {
    this.evalLoading = true;
    this.evalService.evaluate(this.evalForm).subscribe({
      next: () => {
        this.evalLoading = false;
        this.evalMsg = 'Évaluation enregistrée avec succès !';
        // Refresh projects
        this.projectService.getAllProjects().subscribe(r => {
          if (r.success) this.projects = r.data || [];
        });
      },
      error: (err) => {
        this.evalLoading = false;
        alert(err.error?.message || 'Erreur lors de l\'évaluation');
      }
    });
  }

  avgScore(p: Project): number {
    if (!p.evaluations?.length) return 0;
    return Math.round(p.evaluations.reduce((s: number, e: any) => s + (e.score || 0), 0) / p.evaluations.length);
  }

  badge(s: ProjectStatus) {
    return ({ SUBMITTED: 'badge-primary', UNDER_REVIEW: 'badge-warning', ACCEPTED: 'badge-success', REJECTED: 'badge-danger' } as Record<string, string>)[s] || 'badge-slate';
  }
  label(s: ProjectStatus) {
    return ({ SUBMITTED: 'Soumis', UNDER_REVIEW: 'En revue', ACCEPTED: 'Accepté', REJECTED: 'Rejeté' } as Record<string, string>)[s] || s;
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../../core/services/session.service';
import { ApplicationService } from '../../../core/services/application.service';
import { ProjectService } from '../../../core/services/project.service';
import { Session, Application, Round } from '../../../core/models/session.model';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-sessions-explorer',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent, RouterModule, FormsModule],
  template: `
    <h1 class="page-title mb-2">Sessions d'incubation</h1>
    <p class="page-subtitle mb-8">Découvrez les sessions ouvertes et postulez.</p>

    @if (loading) {
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (i of [1,2,3]; track i) {
          <div class="card p-6 animate-pulse"><div class="h-4 bg-slate-200 rounded w-3/4 mb-3"></div><div class="h-3 bg-slate-100 rounded w-1/2 mb-4"></div><div class="h-8 bg-slate-100 rounded w-full"></div></div>
        }
      </div>
    } @else if (sessions.length === 0) {
      <div class="card p-12 text-center">
        <svg class="w-16 h-16 text-slate-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        <p class="text-text-secondary">Aucune session disponible pour le moment.</p>
      </div>
    } @else {
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (s of sessions; track s.id) {
          <div class="card overflow-hidden group transition-all duration-300">
            <div class="h-1.5" [class]="s.status === 'OPEN' ? 'bg-gradient-to-r from-success-400 to-success-500' : s.status === 'IN_PROGRESS' ? 'bg-gradient-to-r from-primary-400 to-primary-500' : 'bg-slate-300'"></div>
            <div class="p-6">
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-semibold text-text-primary">{{ s.name }}</h3>
                <span [class]="sessionBadge(s.status)">{{ sessionLabel(s.status) }}</span>
              </div>
              <p class="text-sm text-text-secondary line-clamp-2 mb-4">{{ s.description }}</p>

              <div class="flex items-center gap-4 text-xs text-text-muted mb-4">
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  {{ s.startDate | date:'dd/MM' }} – {{ s.endDate | date:'dd/MM/yyyy' }}
                </span>
              </div>

              @if (getMyApp(s.id); as app) {
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold" [class]="appColor(app.status)">{{ appLabel(app.status) }}</span>
                  </div>
                  
                  <!-- Formulaire de soumission si éligible -->
                  @if (canSubmit(app)) {
                    <button (click)="openSubmission(s, app)" class="btn-primary btn-xs w-full mt-2">
                      🚀 Soumettre mon projet
                    </button>
                  } @else {
                    <p class="text-[10px] text-text-muted mt-1 text-center italic">En attente de la prochaine étape...</p>
                  }
                </div>
              } @else if (s.status === 'OPEN') {
                <button (click)="confirmApply(s)" class="btn-primary btn-sm w-full">Postuler</button>
              } @else {
                <div class="p-3 rounded-xl bg-slate-50 text-center">
                  <span class="text-xs text-text-muted">Session fermée</span>
                </div>
              }
            </div>
          </div>
        }
      </div>
    }

    <!-- Slide-over Soumission -->
    @if (selectedSession && selectedApp) {
      <div class="overlay" (click)="closeSubmission()"></div>
      <div class="slide-over p-8 w-full max-w-lg">
        <div class="flex items-start justify-between mb-6">
          <div>
            <h2 class="text-xl font-bold text-text-primary">Soumission : {{ selectedSession.name }}</h2>
            <p class="text-sm text-text-muted">Round actuel : {{ selectedApp.currentRoundName || 'Initial' }}</p>
          </div>
          <button (click)="closeSubmission()" class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-text-muted">✕</button>
        </div>

        <form (ngSubmit)="doSubmit()" class="space-y-4">
          <div class="form-group">
            <label class="label">Titre du projet</label>
            <input class="input" [(ngModel)]="subForm.title" name="title" required placeholder="Mon super projet">
          </div>
          <div class="form-group">
            <label class="label">Description</label>
            <textarea class="input min-h-[120px]" [(ngModel)]="subForm.description" name="description" required placeholder="Expliquez votre concept..."></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label class="label">Domaine</label>
              <input class="input" [(ngModel)]="subForm.domain" name="domain">
            </div>
            <div class="form-group">
              <label class="label">Équipe (membres)</label>
              <input class="input" [(ngModel)]="subForm.teamMembers" name="teamMembers">
            </div>
          </div>
          <div class="form-group">
            <label class="label">Lien Vidéo (Pitch)</label>
            <input class="input" [(ngModel)]="subForm.videoUrl" name="videoUrl">
          </div>
          
          <div class="p-4 bg-primary-50 rounded-xl border border-primary-100 text-xs text-primary-700">
             ⚠️ Assurez-vous que tous vos documents sont prêts avant de valider.
          </div>

          <button type="submit" class="btn-primary btn-md w-full shadow-lg" [disabled]="submitting">
            {{ submitting ? 'Envoi en cours...' : 'Confirmer la soumission' }}
          </button>
        </form>
      </div>
    }

    <app-confirm-modal
      [open]="!!applyTarget"
      title="Postuler à cette session ?"
      [message]="'Vous allez postuler à : ' + (applyTarget?.name || '')"
      confirmText="Postuler"
      (confirm)="doApply()"
      (cancel)="applyTarget = null"
    />
  `
})
export class SessionsExplorerComponent implements OnInit {
  sessions: Session[] = [];
  myApps: Application[] = [];
  loading = true;
  submitting = false;
  applyTarget: Session | null = null;
  
  selectedSession: Session | null = null;
  selectedApp: Application | null = null;
  subForm = { title: '', description: '', domain: '', teamMembers: '', videoUrl: '', githubUrl: '' };

  constructor(
    private sessionService: SessionService, 
    private appService: ApplicationService,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.sessionService.getSessions().subscribe(r => {
      this.sessions = r.data || [];
      this.loading = false;
    });
    this.appService.getMyApplications().subscribe(r => { this.myApps = r.data || []; });
  }

  getMyApp(sessionId: number): Application | undefined {
    return this.myApps.find(a => a.sessionId === sessionId);
  }

  canSubmit(app: Application): boolean {
    return app.status === 'PENDING' || app.status.startsWith('ACCEPTED');
  }

  confirmApply(s: Session) { this.applyTarget = s; }

  doApply() {
    if (!this.applyTarget) return;
    this.appService.applyToSession(this.applyTarget.id).subscribe(r => {
      if (r.data) this.myApps.push(r.data);
      this.applyTarget = null;
    });
  }

  openSubmission(s: Session, app: Application) {
    this.selectedSession = s;
    this.selectedApp = app;
    this.subForm = { title: '', description: '', domain: '', teamMembers: '', videoUrl: '', githubUrl: '' };
  }

  closeSubmission() {
    this.selectedSession = null;
    this.selectedApp = null;
  }

  doSubmit() {
    if (!this.subForm.title || !this.subForm.description) return;
    this.submitting = true;
    this.projectService.submitProject(this.subForm as any, undefined, undefined).subscribe({
      next: () => {
        alert('Projet soumis avec succès pour le ' + (this.selectedApp?.currentRoundName || 'Round 1') + ' !');
        this.submitting = false;
        this.closeSubmission();
        this.load();
      },
      error: (err) => {
        alert(err.error?.message || 'Erreur lors de la soumission');
        this.submitting = false;
      }
    });
  }

  sessionBadge(s: string) { return s === 'OPEN' ? 'badge-success' : s === 'IN_PROGRESS' ? 'badge-primary' : 'badge-slate'; }
  sessionLabel(s: string) { return s === 'OPEN' ? 'Ouvert' : s === 'IN_PROGRESS' ? 'En cours' : 'Terminé'; }
  appColor(s: string) {
    if (s === 'PENDING') return 'text-warning-600';
    if (s.startsWith('ACCEPTED')) return 'text-primary-600';
    if (s === 'COMPLETED') return 'text-success-600';
    return 'text-danger-600';
  }
  appLabel(s: string) {
    if (s === 'PENDING') return '⏳ Candidature envoyée';
    if (s === 'COMPLETED') return '🎉 Parcours terminé';
    if (s === 'REJECTED') return '❌ Rejeté';
    const acc = s.match(/ACCEPTED_ROUND_(\d+)/);
    if (acc) return '✅ Admis au Round ' + acc[1];
    const elim = s.match(/ELIMINATED_ROUND_(\d+)/);
    if (elim) return '❌ Éliminé au Round ' + elim[1];
    return s;
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApplicationService } from '../../../core/services/application.service';
import { SessionService } from '../../../core/services/session.service';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/user.model';
import { Application, Session, Round } from '../../../core/models/session.model';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { RoundStepperComponent } from '../../shared/round-stepper/round-stepper.component';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-applicants',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StatusBadgeComponent, RoundStepperComponent, ConfirmModalComponent],
  template: `
    <!-- Header -->
    <div class="flex items-center gap-2 mb-2">
      <a [routerLink]="[basePath + '/sessions', sessionId]" class="text-text-muted hover:text-text-primary">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
      </a>
      <h1 class="page-title">Candidats — {{ session?.name }}</h1>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-3 mb-6 flex-wrap">
      <div class="relative flex-1 max-w-xs">
        <input class="input pl-10" placeholder="Rechercher par nom ou email..." [(ngModel)]="search">
        <svg class="w-5 h-5 absolute left-3 top-2.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
      </div>
      <select class="input max-w-[180px]" [(ngModel)]="filterStatus">
        <option value="">Tous les statuts</option>
        <option value="PENDING">En attente de revue</option>
        <option value="ACCEPTED">Acceptés (En cours)</option>
        <option value="ELIMINATED">Éliminés</option>
        <option value="REJECTED">Rejetés au début</option>
        <option value="COMPLETED">Diplômés / Terminés</option>
      </select>
      <select class="input max-w-[180px]" [(ngModel)]="filterRound">
        <option value="">Tous les rounds</option>
        @for (r of rounds; track r.id) { <option [value]="r.id">{{ r.name }}</option> }
      </select>
      <div class="flex-1"></div>
      <button (click)="exportCSV()" class="btn-ghost btn-sm text-xs border border-slate-200">📥 Export CSV</button>
    </div>

    <!-- Table -->
    <div class="table-container shadow-xl">
      <table class="w-full">
        <thead><tr class="table-header">
          <th class="px-6 py-4 text-left">Candidat</th>
          <th class="px-6 py-4 text-left">Progression</th>
          <th class="px-6 py-4 text-center">Statut Actuel</th>
          <th class="px-6 py-4 text-right">Actions de Workflow</th>
        </tr></thead>
        <tbody>
          @for (a of filtered; track a.id) {
            <tr class="table-row cursor-pointer" [class.opacity-50]="isOut(a)" (click)="selectApp(a)">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold flex-shrink-0 border border-primary-200">
                    {{ initials(a.candidateName) }}
                  </div>
                  <div>
                    <p class="font-bold text-sm text-text-primary">{{ a.candidateName }}</p>
                    <p class="text-xs text-text-muted">{{ a.candidateEmail }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col gap-1">
                  <span class="text-xs font-medium text-text-secondary">{{ a.currentRoundName || 'Initial' }}</span>
                  <div class="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-primary-500 transition-all" [style.width.%]="(a.currentRoundIndex || 0) * 33.3"></div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-center"><app-status-badge [status]="a.status" /></td>
              <td class="px-6 py-4" (click)="$event.stopPropagation()">
                <div class="flex justify-end gap-2">
                  <button (click)="openEval(a)" class="btn-primary btn-sm text-[10px] px-3 py-1 bg-amber-500 hover:bg-amber-600 border-none">Évaluer</button>
                  @if (isAdmin) {
                    @if (a.status === 'PENDING') {
                      <button (click)="confirmAction('accept', a)" class="btn-primary btn-sm text-[10px] px-3 py-1">Accepter</button>
                      <button (click)="confirmAction('reject', a)" class="btn-ghost btn-sm text-[10px] text-danger-500 hover:bg-danger-50 px-3 py-1">Rejeter</button>
                    }
                    @if (a.status.startsWith('ACCEPTED')) {
                      <button (click)="confirmAction('advance', a)" class="btn-accent btn-sm text-[10px] px-3 py-1">Avancer →</button>
                      <button (click)="confirmAction('eliminate', a)" class="btn-ghost btn-sm text-[10px] text-danger-500 hover:bg-danger-50 px-3 py-1">Éliminer</button>
                    }
                  }
                </div>
              </td>
            </tr>
          }
          @if (filtered.length === 0) {
            <tr><td colspan="4" class="p-12 text-center text-text-muted italic">Aucun candidat ne correspond à vos critères.</td></tr>
          }
        </tbody>
      </table>
    </div>

    <!-- Evaluation Modal -->
    @if (evalTarget) {
      <div class="overlay" (click)="evalTarget = null"></div>
      <div class="slide-over p-8 w-full max-w-md">
        <h2 class="text-xl font-bold mb-6">Évaluer {{ evalTarget.candidateName }}</h2>
        <form (ngSubmit)="doEval()" class="space-y-4">
          <div class="form-group">
            <label class="label">Note (0 - 100)</label>
            <input type="number" class="input" [(ngModel)]="evalForm.score" name="score" min="0" max="100" required>
          </div>
          <div class="form-group">
            <label class="label">Commentaire</label>
            <textarea class="input min-h-[120px]" [(ngModel)]="evalForm.comment" name="comment" required placeholder="Votre avis sur le projet..."></textarea>
          </div>
          <div class="form-group">
            <label class="label">Recommandation (Optionnel)</label>
            <input class="input" [(ngModel)]="evalForm.recommendation" name="recom" placeholder="Ex: Très prometteur">
          </div>
          <button type="submit" class="btn-primary btn-md w-full shadow-lg bg-amber-500 hover:bg-amber-600 border-none" [disabled]="submitting">
            {{ submitting ? 'Envoi...' : 'Enregistrer la note' }}
          </button>
        </form>
      </div>
    }

    <!-- Slide-over detail with Evaluation History -->
    @if (selected) {
      <div class="overlay" (click)="selected = null"></div>
      <div class="slide-over p-8 w-full max-w-xl">
        <div class="flex items-start justify-between mb-8">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center text-2xl font-bold border-2 border-primary-200">
              {{ initials(selected.candidateName) }}
            </div>
            <div>
              <h2 class="text-xl font-black text-text-primary">{{ selected.candidateName }}</h2>
              <p class="text-sm text-text-muted">{{ selected.candidateEmail }}</p>
              <div class="flex gap-2 mt-2">
                <app-status-badge [status]="selected.status" />
                <span class="badge-slate">{{ selected.currentRoundName || 'Round 1' }}</span>
              </div>
            </div>
          </div>
          <button (click)="selected = null" class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-text-muted transition-colors">✕</button>
        </div>

        <!-- Round stepper -->
        @if (rounds.length) {
          <div class="mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <h3 class="text-[10px] font-bold text-text-muted mb-6 uppercase tracking-widest">Parcours d'Incubation</h3>
            <app-round-stepper [rounds]="rounds" [currentRoundIndex]="selected.currentRoundIndex" [status]="selected.status" />
          </div>
        }

        <!-- Evaluation History (CRITICAL FEATURE) -->
        <div class="space-y-6">
          <h3 class="text-[10px] font-bold text-text-muted mb-2 uppercase tracking-widest">Historique des Évaluations</h3>
          
          @for (ev of selected.evaluationHistory; track ev.id) {
            <div class="card p-5 border-l-4 border-l-primary-500 bg-white shadow-sm">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <span class="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded uppercase">{{ ev.roundName }}</span>
                  <h4 class="text-sm font-bold mt-1">Évaluation par {{ ev.evaluatorName }}</h4>
                </div>
                <div class="text-right">
                  <span class="text-lg font-black text-primary-600">{{ ev.score }}/100</span>
                  <p class="text-[10px] text-text-muted">{{ ev.evaluatedAt | date:'dd MMM yyyy' }}</p>
                </div>
              </div>
              <p class="text-sm text-text-secondary italic mb-3">"{{ ev.comment }}"</p>
              @if (ev.recommendation) {
                <div class="flex items-start gap-2 bg-slate-50 p-3 rounded-lg">
                  <svg class="w-4 h-4 text-primary-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <p class="text-xs text-text-primary font-medium"><span class="text-text-muted">Recommandation:</span> {{ ev.recommendation }}</p>
                </div>
              }
            </div>
          }

          @if (!selected.evaluationHistory?.length) {
            <div class="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
              <p class="text-sm text-text-muted">Aucune évaluation enregistrée pour le moment.</p>
            </div>
          }
        </div>

        <!-- System Timeline -->
        <div class="mt-10 pt-10 border-t border-slate-100">
          <h3 class="text-[10px] font-bold text-text-muted mb-4 uppercase tracking-widest">Activité Système</h3>
          <div class="space-y-4">
            <div class="flex gap-4 text-xs">
              <div class="w-2.5 h-2.5 rounded-full bg-primary-400 mt-1 flex-shrink-0"></div>
              <div><p class="font-bold text-text-primary">Candidature enregistrée</p><p class="text-text-muted">{{ selected.appliedAt | date:'medium' }}</p></div>
            </div>
            @if (selected.updatedAt !== selected.appliedAt) {
              <div class="flex gap-4 text-xs">
                <div class="w-2.5 h-2.5 rounded-full bg-slate-300 mt-1 flex-shrink-0"></div>
                <div><p class="font-bold text-text-primary">Dernière mise à jour</p><p class="text-text-muted">{{ selected.updatedAt | date:'medium' }}</p></div>
              </div>
            }
          </div>
        </div>
      </div>
    }

    <app-confirm-modal
      [open]="!!pendingAction"
      [title]="actionTitle"
      [message]="actionMessage"
      [confirmText]="actionConfirmText"
      [type]="actionType"
      (confirm)="doAction()"
      (cancel)="pendingAction = null"
    />
  `
})
export class ApplicantsComponent implements OnInit {
  sessionId = 0;
  session: Session | null = null;
  rounds: Round[] = [];
  applicants: Application[] = [];
  selected: Application | null = null;
  search = ''; filterStatus = ''; filterRound = '';
  submitting = false;
  evalTarget: Application | null = null;
  evalForm = { score: 0, comment: '', recommendation: '' };

  pendingAction: { action: string; app: Application } | null = null;
  basePath = '/evaluator';
  isAdmin = false;

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private appSvc: ApplicationService, 
    private sessionSvc: SessionService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.isAdmin = this.auth.userRole() === Role.ADMIN;
    this.basePath = this.router.url.startsWith('/admin') ? '/admin' : '/evaluator';
    this.sessionId = +this.route.snapshot.paramMap.get('id')!;
    const rid = this.route.snapshot.paramMap.get('roundId');
    if (rid) this.filterRound = rid;

    this.sessionSvc.getSessionById(this.sessionId).subscribe(r => {
      this.session = r.data || null;
      this.rounds = (r.data?.rounds || []).sort((a, b) => a.orderIndex - b.orderIndex);
    });
    this.loadApplicants();
  }

  loadApplicants() {
    const rid = this.route.snapshot.paramMap.get('roundId');
    this.appSvc.getSessionApplications(this.sessionId, rid ? +rid : undefined).subscribe(r => this.applicants = r.data || []);
  }

  get filtered(): Application[] {
    return this.applicants.filter(a => {
      // 1. Search filter
      if (this.search && !a.candidateName.toLowerCase().includes(this.search.toLowerCase()) && !a.candidateEmail.toLowerCase().includes(this.search.toLowerCase())) return false;
      
      // 2. Status filter
      if (this.filterStatus === 'ACCEPTED' && !a.status.startsWith('ACCEPTED')) return false;
      if (this.filterStatus === 'ELIMINATED' && !a.status.startsWith('ELIMINATED')) return false;
      if (this.filterStatus && this.filterStatus !== 'ACCEPTED' && this.filterStatus !== 'ELIMINATED' && a.status !== this.filterStatus) return false;
      
      // 3. Round filter (Improved logic)
      if (this.filterRound) {
        const rid = +this.filterRound;
        // If filtering by Round 1, include those with currentRoundId == null AND status PENDING or ACCEPTED_ROUND_1
        if (rid === this.rounds[0]?.id) {
           const isRound1 = a.currentRoundId === rid || (a.currentRoundId == null && (a.status === 'PENDING' || a.status === 'ACCEPTED_ROUND_1'));
           if (!isRound1) return false;
        } else if (a.currentRoundId !== rid) {
          return false;
        }
      }
      return true;
    });
  }

  isOut(a: Application) { return a.status === 'REJECTED' || a.status.startsWith('ELIMINATED'); }
  initials(name: string) { return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(); }
  selectApp(a: Application) { this.selected = a; }

  confirmAction(action: string, app: Application) { this.pendingAction = { action, app }; }

  get actionTitle() {
    const m: Record<string, string> = { accept: 'Valider la candidature ?', reject: 'Rejeter la candidature ?', advance: 'Passer au Round suivant ?', eliminate: 'Éliminer le candidat ?' };
    return m[this.pendingAction?.action || ''] || '';
  }
  get actionMessage() {
    const n = this.pendingAction?.app.candidateName || '';
    const m: Record<string, string> = { accept: `${n} sera admis au Round 1 et pourra soumettre son dossier technique.`, reject: `${n} ne sera pas admis dans cette session.`, advance: `${n} sera promu à l'étape suivante. Les évaluateurs du prochain round pourront voir vos remarques.`, eliminate: `${n} sera arrêté à cette étape du processus.` };
    return m[this.pendingAction?.action || ''] || '';
  }
  get actionConfirmText() {
    const m: Record<string, string> = { accept: 'Confirmer l\'Admission', reject: 'Confirmer le Rejet', advance: 'Promouvoir au Round suivant', eliminate: 'Confirmer l\'Élimination' };
    return m[this.pendingAction?.action || ''] || '';
  }
  get actionType(): 'danger' | 'primary' {
    return this.pendingAction?.action === 'reject' || this.pendingAction?.action === 'eliminate' ? 'danger' : 'primary';
  }

  openEval(a: Application) {
    this.evalTarget = a;
    this.evalForm = { score: 0, comment: '', recommendation: '' };
  }

  doEval() {
    if (!this.evalTarget) return;
    this.submitting = true;
    this.appSvc.evaluateApplication(this.evalTarget.id, this.evalForm).subscribe({
      next: () => {
        alert('Évaluation enregistrée avec succès !');
        this.submitting = false;
        this.evalTarget = null;
        this.loadApplicants();
      },
      error: (err) => {
        alert(err.error?.message || 'Erreur lors de l\'évaluation. Vérifiez que le candidat a bien soumis son projet pour ce round.');
        this.submitting = false;
      }
    });
  }

  doAction() {
    if (!this.pendingAction) return;
    const { action, app } = this.pendingAction;
    const obs = action === 'accept' ? this.appSvc.acceptApplication(app.id)
      : action === 'reject' ? this.appSvc.rejectApplication(app.id)
      : action === 'advance' ? this.appSvc.advanceApplication(app.id)
      : this.appSvc.eliminateApplication(app.id);
    obs.subscribe(() => { this.pendingAction = null; this.loadApplicants(); if (this.selected && this.selected.id === app.id) this.selected = null; });
  }

  exportCSV() {
    const rows = [['Nom', 'Email', 'Round', 'Statut', 'Date'].join(',')];
    this.filtered.forEach(a => rows.push([a.candidateName, a.candidateEmail, a.currentRoundName || '', a.status, a.appliedAt].join(',')));
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `candidats_session_${this.sessionId}.csv`; a.click();
    URL.revokeObjectURL(url);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SessionService } from '../../../core/services/session.service';
import { RoundService } from '../../../core/services/round.service';
import { ApplicationService } from '../../../core/services/application.service';
import { UserService } from '../../../core/services/user.service';
import { Session, Round, Application } from '../../../core/models/session.model';
import { User, Role } from '../../../core/models/user.model';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-session-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StatusBadgeComponent, ConfirmModalComponent],
  template: `
    @if (session) {
      <!-- Header -->
      <div class="flex items-center gap-2 mb-2">
        <a [routerLink]="basePath + '/sessions'" class="text-text-muted hover:text-text-primary">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </a>
        <h1 class="page-title">{{ session.name }}</h1>
        <span [class]="statusBadge(session.status)" class="ml-2">{{ statusLabel(session.status) }}</span>
      </div>
      <p class="page-subtitle mb-8">{{ session.description }}</p>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left: Round Builder -->
        <div class="lg:col-span-2">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-black text-text-primary tracking-tight">Structure de l'Incubation (Rounds)</h2>
            @if (isAdmin) {
              <button (click)="showAddRound = true" class="btn-primary btn-sm rounded-xl px-4">+ Ajouter un Round</button>
            }
          </div>

          @if (showAddRound) {
            <div class="card p-6 mb-6 bg-slate-50 border-slate-200">
              <h3 class="text-sm font-bold mb-4 uppercase tracking-wider text-text-muted">Nouveau Round</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="form-group">
                  <label class="label">Nom du round *</label>
                  <input class="input" [(ngModel)]="newRoundName" placeholder="Ex: Round 1 : Idéation">
                </div>
                <div class="form-group">
                  <label class="label">Évaluateurs assignés</label>
                  <div class="relative">
                    <select class="input appearance-none" multiple [(ngModel)]="selectedEvaluatorIds">
                      @for (e of allEvaluators; track e.id) {
                        <option [value]="e.id">{{ e.firstName }} {{ e.lastName }} ({{ e.role }})</option>
                      }
                    </select>
                    <p class="text-[10px] text-text-muted mt-1">Maintenez Ctrl (ou Cmd) pour en sélectionner plusieurs.</p>
                  </div>
                </div>
              </div>
              <div class="flex justify-end gap-2">
                <button (click)="showAddRound = false" class="btn-ghost btn-sm">Annuler</button>
                <button (click)="addRound()" class="btn-primary btn-sm" [disabled]="!newRoundName">Enregistrer le Round</button>
              </div>
            </div>
          }

          <!-- Pipeline -->
          <div class="space-y-4 relative">
            @for (r of rounds; track r.id; let i = $index) {
              <div class="card p-5 flex items-center gap-6 group relative z-10">
                <!-- Order number -->
                <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black flex-shrink-0 shadow-sm border"
                     [class]="r.status === 'ACTIVE' ? 'bg-primary-600 text-white border-primary-700' : r.status === 'COMPLETED' ? 'bg-success-500 text-white border-success-600' : 'bg-white text-text-muted border-slate-200'">
                  {{ r.orderIndex }}
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  @if (editRoundId === r.id) {
                    <div class="flex flex-col gap-2">
                      <input class="input py-2 text-sm" [(ngModel)]="editRoundName" (keyup.enter)="saveRound(r)">
                      <select class="input text-xs py-1" multiple [(ngModel)]="selectedEvaluatorIds">
                        @for (e of allEvaluators; track e.id) {
                          <option [value]="e.id">{{ e.firstName }} {{ e.lastName }}</option>
                        }
                      </select>
                    </div>
                  } @else {
                    <h4 class="font-bold text-text-primary">{{ r.name }}</h4>
                    <!-- Assigned Evaluators list -->
                    <div class="flex flex-wrap gap-1 mt-1.5">
                      @for (ev of r.evaluators; track ev.id) {
                        <span class="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                          {{ ev.firstName }} {{ ev.lastName }}
                        </span>
                      }
                      @if (!r.evaluators?.length) {
                        <span class="text-[10px] text-danger-500 italic">Aucun évaluateur assigné</span>
                      }
                    </div>
                  }
                </div>

                <!-- Status -->
                <span class="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg flex-shrink-0 border"
                      [class]="r.status === 'ACTIVE' ? 'bg-primary-50 text-primary-700 border-primary-100' : r.status === 'COMPLETED' ? 'bg-success-50 text-success-700 border-success-100' : 'bg-slate-50 text-slate-500 border-slate-100'">
                  {{ r.status === 'ACTIVE' ? 'En cours' : r.status === 'COMPLETED' ? 'Terminé' : 'À venir' }}
                </span>

                <!-- Applicant count badge -->
                @if (roundCounts[r.id] !== undefined) {
                  <div class="flex flex-col items-center">
                    <span class="text-lg font-bold text-text-primary">{{ roundCounts[r.id] }}</span>
                    <span class="text-[10px] text-text-muted uppercase">Candidats</span>
                  </div>
                }

                <!-- Actions -->
                <div class="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  @if (editRoundId === r.id) {
                    <button (click)="saveRound(r)" class="p-1.5 hover:bg-success-50 text-success-600 rounded-lg">✓</button>
                    <button (click)="editRoundId = null" class="p-1.5 hover:bg-slate-100 text-text-muted rounded-lg">✕</button>
                  } @else {
                    @if (isAdmin) {
                      <button (click)="editRoundId = r.id; editRoundName = r.name; selectedEvaluatorIds = getEvIds(r)" 
                              class="p-2 hover:bg-slate-100 rounded-lg text-text-muted transition-colors" title="Modifier">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                      </button>
                      <button (click)="delRound = r" class="p-2 hover:bg-danger-50 rounded-lg text-danger-500 transition-colors" title="Supprimer">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    }
                    <a [routerLink]="[basePath + '/sessions', session.id, 'rounds', r.id, 'applicants']" class="btn-ghost btn-sm text-xs font-bold">Voir Candidats →</a>
                  }
                </div>
              </div>

              <!-- Connector Line -->
              @if (i < rounds.length - 1) {
                <div class="absolute left-11 w-0.5 h-10 bg-slate-100 -mt-2 z-0"></div>
              }
            }

            @if (rounds.length === 0) {
              <div class="card p-12 text-center text-text-muted border-dashed">
                <p class="text-sm">Aucun round n'a encore été configuré pour cette session.</p>
                <button (click)="showAddRound = true" class="text-primary-600 font-medium mt-2 hover:underline">Démarrer la configuration</button>
              </div>
            }
          </div>
        </div>

        <!-- Right: Applicants Summary -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">Candidats (Top 5)</h2>
            <a [routerLink]="[basePath + '/sessions', session.id, 'applicants']" class="text-primary-600 text-sm font-medium hover:underline">Voir tout →</a>
          </div>
          <div class="card p-4 space-y-4">
            @for (app of applicants.slice(0, 5); track app.id) {
              <div class="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p class="text-sm font-bold text-text-primary">{{ app.candidateName }}</p>
                  <p class="text-[11px] text-text-muted">{{ app.currentRoundName || 'À traiter' }}</p>
                </div>
                <app-status-badge [status]="app.status" />
              </div>
            }
            @if (applicants.length === 0) {
              <div class="text-center py-10">
                <svg class="w-10 h-10 text-slate-200 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                <p class="text-xs text-text-muted">Aucune candidature reçue.</p>
              </div>
            }
          </div>
        </div>
      </div>
    }

    <app-confirm-modal
      [open]="!!delRound"
      title="Supprimer ce round ?"
      [message]="'Attention : La suppression de « ' + (delRound?.name || '') + ' » pourrait impacter les candidatures liées.'"
      confirmText="Supprimer définitivement" type="danger"
      (confirm)="doDeleteRound()" (cancel)="delRound = null"
    />
  `
})
export class SessionDetailComponent implements OnInit {
  session: Session | null = null;
  rounds: Round[] = [];
  applicants: Application[] = [];
  allEvaluators: User[] = [];
  roundCounts: Record<number, number> = {};
  
  showAddRound = false;
  newRoundName = '';
  selectedEvaluatorIds: number[] = [];
  
  editRoundId: number | null = null;
  editRoundName = '';
  
  delRound: Round | null = null;
  basePath = '/evaluator';
  isAdmin = false;

  constructor(
    private route: ActivatedRoute, 
    private sessionSvc: SessionService, 
    private roundSvc: RoundService, 
    private appSvc: ApplicationService,
    private userSvc: UserService,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.isAdmin = this.auth.userRole() === Role.ADMIN;
    this.basePath = this.router.url.startsWith('/admin') ? '/admin' : '/evaluator';
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.loadSession(id);
    this.loadEvaluators();
    this.appSvc.getSessionApplications(id).subscribe(r => {
      this.applicants = r.data || [];
      this.applicants.forEach(a => {
        if (a.currentRoundId) this.roundCounts[a.currentRoundId] = (this.roundCounts[a.currentRoundId] || 0) + 1;
      });
    });
  }

  loadSession(id: number) {
    this.sessionSvc.getSessionById(id).subscribe(r => {
      this.session = r.data || null;
      this.rounds = (r.data?.rounds || []).sort((a, b) => a.orderIndex - b.orderIndex);
    });
  }

  loadEvaluators() {
    this.userSvc.getEvaluators().subscribe(r => {
      this.allEvaluators = r.data || [];
    });
  }

  addRound() {
    if (!this.session || !this.newRoundName) return;
    const body = { 
      name: this.newRoundName, 
      orderIndex: this.rounds.length + 1,
      evaluatorIds: this.selectedEvaluatorIds.map(Number)
    };
    
    this.roundSvc.createRound(this.session.id, body).subscribe(() => {
      this.newRoundName = '';
      this.selectedEvaluatorIds = [];
      this.showAddRound = false;
      this.loadSession(this.session!.id);
    });
  }

  saveRound(r: Round) {
    if (!this.session) return;
    const body = { 
      name: this.editRoundName,
      orderIndex: r.orderIndex,
      status: r.status,
      evaluatorIds: this.selectedEvaluatorIds.map(Number)
    };
    this.roundSvc.updateRound(this.session.id, r.id, body).subscribe(() => {
      this.editRoundId = null;
      this.loadSession(this.session!.id);
    });
  }

  doDeleteRound() {
    if (!this.session || !this.delRound) return;
    this.roundSvc.deleteRound(this.session.id, this.delRound.id).subscribe(() => {
      this.delRound = null;
      this.loadSession(this.session!.id);
    });
  }

  getEvIds(r: Round): number[] {
    return r.evaluators?.map(e => e.id) || [];
  }

  statusBadge(s: string) { return s === 'OPEN' ? 'badge-success' : s === 'IN_PROGRESS' ? 'badge-primary' : 'badge-slate'; }
  statusLabel(s: string) { return s === 'OPEN' ? 'Ouvert' : s === 'IN_PROGRESS' ? 'En cours' : 'Terminé'; }
}

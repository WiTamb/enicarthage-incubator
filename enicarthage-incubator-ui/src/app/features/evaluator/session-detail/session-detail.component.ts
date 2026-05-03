import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SessionService } from '../../../core/services/session.service';
import { RoundService } from '../../../core/services/round.service';
import { ApplicationService } from '../../../core/services/application.service';
import { UserService } from '../../../core/services/user.service';
import { QuestionnaireService } from '../../../core/services/questionnaire.service';
import { Session, Round, Application, QuestionType, SessionQuestion } from '../../../core/models/session.model';
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
                    <p class="text-[10px] text-text-muted mt-1">Maintenez Ctrl pour en sélectionner plusieurs.</p>
                  </div>
                </div>
                <div class="form-group">
                  <label class="label">Président du Jury *</label>
                  <select class="input" [(ngModel)]="newJuryPresidentId">
                    <option [ngValue]="null">-- Sélectionner --</option>
                    @for (e of getSelectedEvaluatorObjects(); track e.id) {
                      <option [ngValue]="e.id">{{ e.firstName }} {{ e.lastName }}</option>
                    }
                  </select>
                  <p class="text-[10px] text-text-muted mt-1">Sera responsable de la validation finale de ce round.</p>
                </div>
              </div>
              <div class="form-group mb-6">
                <label class="label">Nombre de candidats à retenir pour le round suivant (Optionnel)</label>
                <input type="number" class="input" [(ngModel)]="newRoundPassingCount" min="0" placeholder="Ex: 5">
              </div>

              <div class="border-t border-slate-200 pt-6 mb-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-sm font-bold uppercase tracking-wider text-text-muted">Questionnaire Obligatoire *</h3>
                  <button (click)="addNewRoundQuestion()" class="btn-outline btn-sm py-1 px-3 text-xs">+ Ajouter question</button>
                </div>
                
                @for (q of newRoundQuestions; track q; let i = $index) {
                  <div class="flex items-start gap-3 mb-3 p-3 bg-white border border-slate-200 rounded-xl relative">
                    <div class="flex-1 form-group mb-0">
                      <input class="input text-sm py-1.5" [(ngModel)]="q.label" placeholder="Libellé de la question..." required>
                    </div>
                    <div class="w-1/4 form-group mb-0">
                      <select class="input text-sm py-1.5" [(ngModel)]="q.type">
                        <option value="TEXT">Texte</option>
                        <option value="TEXTAREA">Paragraphe</option>
                        <option value="FILE">Fichier</option>
                        <option value="VIDEO_URL">Vidéo</option>
                        <option value="RADIO">Radio</option>
                        <option value="CHECKBOX">Cases</option>
                      </select>
                    </div>
                    @if (newRoundQuestions.length > 1) {
                      <button (click)="removeNewRoundQuestion(i)" class="text-danger-500 hover:bg-danger-50 p-1.5 rounded-lg mt-0.5">✕</button>
                    }
                  </div>
                  @if (q.type === 'RADIO' || q.type === 'CHECKBOX') {
                    <div class="form-group ml-4 mb-3">
                      <input class="input text-xs py-1" [(ngModel)]="q.options" placeholder="Options (séparées par des virgules)">
                    </div>
                  }
                }
              </div>

              @if (addRoundError) {
                <div class="p-3 bg-danger-50 text-danger-600 text-sm rounded-lg mb-4">{{ addRoundError }}</div>
              }

              <div class="flex justify-end gap-2">
                <button (click)="showAddRound = false" class="btn-ghost btn-sm">Annuler</button>
                <button (click)="addRound()" class="btn-primary btn-sm" [disabled]="!newRoundName || !newJuryPresidentId || isSavingRound">
                  {{ isSavingRound ? 'Enregistrement...' : 'Enregistrer le Round' }}
                </button>
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
                      <input class="input py-2 text-sm" [(ngModel)]="editRoundName" placeholder="Nom du round" (keyup.enter)="saveRound(r)">
                      <div class="flex gap-2">
                        <select class="input text-xs py-1 flex-1" multiple [(ngModel)]="selectedEvaluatorIds">
                          @for (e of allEvaluators; track e.id) {
                            <option [value]="e.id">{{ e.firstName }} {{ e.lastName }}</option>
                          }
                        </select>
                        <input type="number" class="input text-xs py-1 w-24" [(ngModel)]="editRoundPassingCount" placeholder="Retenus">
                      </div>
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
                      <button (click)="editRoundId = r.id; editRoundName = r.name; editRoundPassingCount = r.passingCandidatesCount || 0; selectedEvaluatorIds = getEvIds(r)" 
                              class="p-2 hover:bg-slate-100 rounded-lg text-text-muted transition-colors" title="Modifier">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                      </button>
                      <button (click)="openQuestionnaire(r)" class="p-2 hover:bg-slate-100 rounded-lg text-primary-600 transition-colors" title="Questionnaire">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                      </button>
                      <button (click)="delRound = r" class="p-2 hover:bg-danger-50 rounded-lg text-danger-500 transition-colors" title="Supprimer">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    }
                    <a [routerLink]="[basePath + '/sessions', session.id, 'rounds', r.id, 'applicants']" class="btn-ghost btn-sm text-xs font-bold mb-1">Candidats →</a>
                    <a [routerLink]="[basePath + '/sessions', session.id, 'rounds', r.id, 'selection']" class="btn-ghost text-primary-600 btn-sm text-xs font-bold">Résultats →</a>
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
      <!-- Admin: Questionnaire Builder Modal -->
      @if (showQuestionnaire && questionnaireTarget) {
        <div class="overlay" (click)="closeQuestionnaire()"></div>
        <div class="slide-over p-8 w-full max-w-2xl overflow-y-auto" style="max-height:100vh">
          <div class="flex items-start justify-between mb-6">
            <div>
              <h2 class="text-xl font-bold text-text-primary">Questionnaire</h2>
              <p class="text-sm text-text-muted mt-1">{{ session.name }} - {{ questionnaireTarget.name }}</p>
            </div>
            <button (click)="closeQuestionnaire()" class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-text-muted">✕</button>
          </div>

          <div class="space-y-4 mb-6">
            @for (q of editQuestions; track q; let i = $index) {
              <div class="p-5 bg-slate-50 rounded-2xl border border-slate-100 relative">
                <button type="button" (click)="removeQuestion(i)" class="absolute top-3 right-3 text-text-muted hover:text-danger-500 text-xs font-bold">✕</button>

                <div class="grid grid-cols-2 gap-3 mb-3">
                  <div class="col-span-2 form-group">
                    <label class="label text-[10px]">Question {{ i + 1 }}</label>
                    <input class="input bg-white" [(ngModel)]="q.label" [name]="'label-' + i" placeholder="Libellé de la question..." required>
                  </div>
                  <div class="form-group">
                    <label class="label text-[10px]">Type de réponse</label>
                    <select class="input bg-white text-sm" [(ngModel)]="q.type" [name]="'type-' + i">
                      <option value="TEXT">Texte court</option>
                      <option value="TEXTAREA">Texte long</option>
                      <option value="FILE">Fichier</option>
                      <option value="VIDEO_URL">Lien vidéo</option>
                      <option value="RADIO">Choix unique</option>
                      <option value="CHECKBOX">Choix multiple</option>
                    </select>
                  </div>
                  <div class="form-group flex items-end pb-1">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" [(ngModel)]="q.required" [name]="'req-' + i" class="w-4 h-4 rounded text-primary-600">
                      <span class="text-sm text-text-secondary">Obligatoire</span>
                    </label>
                  </div>
                </div>

                @if (q.type === 'RADIO' || q.type === 'CHECKBOX') {
                  <div class="form-group">
                    <label class="label text-[10px]">Options (séparées par des virgules)</label>
                    <input class="input bg-white text-sm" [(ngModel)]="q.options" [name]="'opts-' + i" placeholder="Option 1, Option 2, Option 3">
                  </div>
                }
              </div>
            }
          </div>

          <div class="flex gap-3 mb-6">
            <button type="button" (click)="addQuestion()" class="btn-outline btn-sm flex-1">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
              Ajouter une question
            </button>
          </div>

          @if (questionnaireError) {
            <div class="p-4 bg-danger-50 border border-danger-100 rounded-xl text-sm text-danger-600 mb-4">{{ questionnaireError }}</div>
          }
          @if (questionnaireSuccess) {
            <div class="p-4 bg-success-50 border border-success-100 rounded-xl text-sm text-success-600 mb-4 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
              Questionnaire sauvegardé avec succès !
            </div>
          }

          <button (click)="saveQuestionnaire()" class="btn-primary btn-md w-full" [disabled]="savingQuestionnaire">
            {{ savingQuestionnaire ? 'Sauvegarde...' : 'Sauvegarder le questionnaire' }}
          </button>
        </div>
      }

      <!-- Delete confirm -->
      <app-confirm-modal
        [open]="!!delRound"
        title="Supprimer ce round ?"
        [message]="'Le round ' + (delRound?.name || '') + ' sera supprimé definitivement.'"
        confirmText="Supprimer"
        type="danger"
        (confirm)="deleteRound()"
        (cancel)="delRound = null"
      />
    }
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
  newRoundPassingCount: number | null = null;
  selectedEvaluatorIds: number[] = [];
  newJuryPresidentId: number | null = null;
  newRoundQuestions: any[] = [{ label: '', type: 'TEXT', required: true, orderIndex: 0 }];
  isSavingRound = false;
  addRoundError = '';
  
  editRoundId: number | null = null;
  editRoundName = '';
  editRoundPassingCount: number | null = null;
  
  delRound: Round | null = null;
  basePath = '/evaluator';
  isAdmin = false;
  
  // Questionnaire state
  showQuestionnaire = false;
  questionnaireTarget: Round | null = null;
  editQuestions: any[] = [];
  savingQuestionnaire = false;
  questionnaireError = '';
  questionnaireSuccess = false;

  constructor(
    private route: ActivatedRoute, 
    private sessionSvc: SessionService, 
    private roundSvc: RoundService, 
    private appSvc: ApplicationService,
    private userSvc: UserService,
    private questionnaireSvc: QuestionnaireService,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.isAdmin = this.router.url.startsWith('/admin');
    this.basePath = this.isAdmin ? '/admin' : '/evaluator';
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
      let allRounds = r.data?.rounds || [];
      if (!this.isAdmin && this.auth.userRole() === 'ADMIN') {
        const myEmail = this.auth.currentUser()?.email || '';
        allRounds = allRounds.filter(rnd => rnd.evaluators?.some(e => e.email === myEmail));
      }
      this.rounds = allRounds.sort((a, b) => a.orderIndex - b.orderIndex);
    });
  }

  loadEvaluators() {
    this.userSvc.getEvaluators().subscribe(r => {
      this.allEvaluators = r.data || [];
    });
  }

  getSelectedEvaluatorObjects() {
    return this.allEvaluators.filter(e => this.selectedEvaluatorIds.includes(e.id));
  }

  addNewRoundQuestion() {
    this.newRoundQuestions.push({ label: '', type: 'TEXT', required: true, orderIndex: this.newRoundQuestions.length });
  }

  removeNewRoundQuestion(index: number) {
    this.newRoundQuestions.splice(index, 1);
  }

  addRound() {
    this.addRoundError = '';
    if (!this.session || !this.newRoundName || !this.newJuryPresidentId) {
      this.addRoundError = 'Veuillez remplir le nom du round et sélectionner un président du jury.';
      return;
    }
    
    if (this.newRoundQuestions.length === 0 || this.newRoundQuestions.some(q => !q.label.trim())) {
      this.addRoundError = 'Vous devez ajouter au moins une question avec un libellé valide.';
      return;
    }

    this.isSavingRound = true;

    const body: any = { 
      name: this.newRoundName, 
      orderIndex: this.rounds.length + 1,
      passingCandidatesCount: this.newRoundPassingCount ?? undefined,
      evaluatorIds: this.selectedEvaluatorIds.map(Number),
      juryPresidentId: this.newJuryPresidentId,
      questions: this.newRoundQuestions.map((q, idx) => ({ ...q, orderIndex: idx }))
    };
    
    this.roundSvc.createRound(this.session.id, body).subscribe({
      next: () => {
        this.newRoundName = '';
        this.newRoundPassingCount = null;
        this.selectedEvaluatorIds = [];
        this.newJuryPresidentId = null;
        this.newRoundQuestions = [{ label: '', type: 'TEXT', required: true, orderIndex: 0 }];
        this.showAddRound = false;
        this.isSavingRound = false;
        this.loadSession(this.session!.id);
      },
      error: (err) => {
        this.isSavingRound = false;
        this.addRoundError = err.error?.message || 'Erreur lors de la création du round.';
      }
    });
  }

  saveRound(r: Round) {
    if (!this.session) return;
    const body: Partial<Round> & { evaluatorIds: number[] } = { 
      name: this.editRoundName,
      orderIndex: r.orderIndex,
      status: r.status,
      passingCandidatesCount: this.editRoundPassingCount ?? undefined,
      evaluatorIds: this.selectedEvaluatorIds.map(Number)
    };
    this.roundSvc.updateRound(this.session.id, r.id, body).subscribe(() => {
      this.editRoundId = null;
      this.loadSession(this.session!.id);
    });
  }

  deleteRound() {
    if (!this.session || !this.delRound) return;
    this.roundSvc.deleteRound(this.session.id, this.delRound.id).subscribe(() => {
      this.delRound = null;
      this.loadSession(this.session!.id);
    });
  }

  // ---- Questionnaire Builder ----
  openQuestionnaire(r: Round) {
    this.questionnaireTarget = r;
    this.showQuestionnaire = true;
    this.questionnaireError = '';
    this.questionnaireSuccess = false;
    this.editQuestions = [];

    this.questionnaireSvc.getQuestionnaire(r.id).subscribe(res => {
      if (res.data && res.data.length > 0) {
        this.editQuestions = res.data.map(q => ({ ...q }));
      }
    });
  }

  closeQuestionnaire() {
    this.showQuestionnaire = false;
    this.questionnaireTarget = null;
  }

  addQuestion() {
    this.editQuestions.push({
      label: '',
      type: 'TEXT' as QuestionType,
      required: true,
      orderIndex: this.editQuestions.length,
      options: ''
    });
  }

  removeQuestion(index: number) {
    this.editQuestions.splice(index, 1);
  }

  saveQuestionnaire() {
    if (!this.questionnaireTarget) return;
    const invalid = this.editQuestions.filter(q => !q.label?.trim());
    if (invalid.length > 0) {
      this.questionnaireError = 'Veuillez remplir le libellé de toutes les questions.';
      return;
    }

    this.savingQuestionnaire = true;
    this.questionnaireError = '';
    this.questionnaireSvc.saveQuestionnaire(this.questionnaireTarget.id, this.editQuestions).subscribe({
      next: () => {
        this.savingQuestionnaire = false;
        this.questionnaireSuccess = true;
        setTimeout(() => this.closeQuestionnaire(), 1500);
      },
      error: (err: any) => {
        this.savingQuestionnaire = false;
        this.questionnaireError = err.error?.message || 'Erreur lors de la sauvegarde.';
      }
    });
  }

  getEvIds(r: Round): number[] {
    return r.evaluators?.map(e => e.id) || [];
  }

  statusBadge(s: string) { return s === 'OPEN' ? 'badge-success' : s === 'IN_PROGRESS' ? 'badge-primary' : 'badge-slate'; }
  statusLabel(s: string) { return s === 'OPEN' ? 'Ouvert' : s === 'IN_PROGRESS' ? 'En cours' : 'Terminé'; }
}

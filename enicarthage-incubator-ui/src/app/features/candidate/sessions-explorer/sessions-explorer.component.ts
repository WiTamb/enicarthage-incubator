import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../../core/services/session.service';
import { ApplicationService } from '../../../core/services/application.service';
import { QuestionnaireService } from '../../../core/services/questionnaire.service';
import { Session, Application, SessionQuestion } from '../../../core/models/session.model';
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
                <!-- Already applied -->
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold" [class]="appColor(app.status)">{{ appLabel(app.status) }}</span>
                  </div>
                  @if (needsQuestionnaire(s.id)) {
                    <!-- Applied but questionnaire not yet submitted -->
                    <button (click)="openQuestionnaire(s, app)" class="btn-primary btn-xs w-full mt-2">
                      Remplir le questionnaire
                    </button>
                  } @else {
                    <div class="flex items-center gap-2 mt-2 mb-3">
                      <svg class="w-4 h-4 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                      <span class="text-[10px] text-success-600 font-medium">Questionnaire soumis ✓</span>
                    </div>
                    @if (canSubmitProject(app)) {
                      <button (click)="openSubmission(s, app)" class="btn-primary btn-xs w-full shadow-md bg-amber-500 hover:bg-amber-600 border-none">
                        Soumettre mon projet
                      </button>
                    } @else if (app.status === 'PENDING') {
                      <p class="text-[10px] text-text-muted mt-1 text-center italic">En attente de validation par l'admin...</p>
                    }
                  }
                </div>
              } @else if (s.status === 'OPEN') {
                <!-- Not yet applied to an OPEN session — questionnaire is the gate -->
                <button (click)="openQuestionnaire(s, null)" class="btn-primary btn-sm w-full flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                  Postuler (questionnaire requis)
                </button>
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

    <!-- Questionnaire Slide-over (THE application gate) -->
    @if (questionnaireSession) {
      <div class="overlay" (click)="closeQuestionnaire()"></div>
      <div class="slide-over p-8 w-full max-w-2xl overflow-y-auto" style="max-height:100vh">
        <div class="flex items-start justify-between mb-2">
          <div>
            <h2 class="text-xl font-bold text-text-primary">{{ questionnaireSession.name }}</h2>
            <p class="text-sm text-text-muted mt-1">
              @if (!questionnaireApp) {
                Répondez au questionnaire pour soumettre votre candidature
              } @else {
                Mettez à jour vos réponses au questionnaire
              }
            </p>
          </div>
          <button (click)="closeQuestionnaire()" class="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-text-muted">✕</button>
        </div>

        <!-- Info banner -->
        @if (!questionnaireApp) {
          <div class="mb-6 p-3 bg-primary-50 border border-primary-100 rounded-xl flex items-start gap-2 text-xs text-primary-700">
            <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>Votre candidature sera créée automatiquement après la soumission du questionnaire.</span>
          </div>
        }

        @if (questionsLoading) {
          <div class="space-y-4">
            @for (i of [1,2,3]; track i) {
              <div class="h-16 bg-slate-100 rounded-xl animate-pulse"></div>
            }
          </div>
        } @else if (questions.length === 0) {
          <!-- No questionnaire configured — allow direct apply -->
          <div class="card p-8 text-center">
            <svg class="w-12 h-12 text-success-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <p class="text-text-secondary mb-1 font-medium">Aucun questionnaire pour cette session.</p>
            <p class="text-xs text-text-muted mb-5">Vous pouvez candidater directement.</p>
            <button (click)="submitQuestionnaire()" class="btn-primary btn-sm flex items-center gap-2 mx-auto" [disabled]="submitting">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
              {{ submitting ? 'Envoi…' : 'Confirmer ma candidature' }}
            </button>
          </div>
        } @else {
          <form (ngSubmit)="submitQuestionnaire()" class="space-y-6">
            @for (q of questions; track q.id; let i = $index) {
              <div class="form-group">
                <label class="label">
                  {{ i + 1 }}. {{ q.label }}
                  @if (q.required) { <span class="text-danger-500 ml-1">*</span> }
                </label>

                @switch (q.type) {
                  @case ('TEXT') {
                    <input class="input" [(ngModel)]="answers[q.id]" [name]="'q_' + q.id"
                           placeholder="Votre réponse..." [required]="q.required">
                  }
                  @case ('TEXTAREA') {
                    <textarea class="input min-h-[120px]" [(ngModel)]="answers[q.id]" [name]="'q_' + q.id"
                              placeholder="Votre réponse détaillée..." [required]="q.required"></textarea>
                  }
                  @case ('VIDEO_URL') {
                    <input class="input" type="url" [(ngModel)]="answers[q.id]" [name]="'q_' + q.id"
                           placeholder="https://..." [required]="q.required">
                  }
                  @case ('FILE') {
                    <div class="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-primary-300 transition-colors">
                      <svg class="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                      <p class="text-xs text-text-muted mb-2">Cliquez pour choisir un fichier</p>
                      <input type="file" class="w-full text-xs text-text-muted" (change)="onFileChange($event, q.id)" [required]="q.required && !answers[q.id]">
                      @if (answers[q.id]) {
                        <p class="text-xs text-success-600 mt-1">✓ {{ answers[q.id] }}</p>
                      }
                    </div>
                  }
                  @case ('RADIO') {
                    <div class="space-y-2 mt-2">
                      @for (opt of getOptions(q); track opt) {
                        <label class="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                          <input type="radio" [name]="'q_' + q.id" [value]="opt" [(ngModel)]="answers[q.id]" class="w-4 h-4 text-primary-600">
                          <span class="text-sm text-text-primary">{{ opt }}</span>
                        </label>
                      }
                    </div>
                  }
                  @case ('CHECKBOX') {
                    <div class="space-y-2 mt-2">
                      @for (opt of getOptions(q); track opt) {
                        <label class="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                          <input type="checkbox" [value]="opt" (change)="onCheckbox($event, q.id, opt)" [checked]="isChecked(q.id, opt)" class="w-4 h-4 text-primary-600 rounded">
                          <span class="text-sm text-text-primary">{{ opt }}</span>
                        </label>
                      }
                    </div>
                  }
                }
              </div>
            }

            @if (submitError) {
              <div class="p-4 bg-danger-50 border border-danger-100 rounded-xl text-sm text-danger-600">{{ submitError }}</div>
            }
            @if (submitSuccess) {
              <div class="p-4 bg-success-50 border border-success-100 rounded-xl text-sm text-success-600 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                Candidature soumise avec succès ! Vous serez redirigé...
              </div>
            }

            <button type="submit" class="btn-primary btn-md w-full shadow-lg flex items-center justify-center gap-2" [disabled]="submitting">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {{ submitting ? 'Envoi en cours...' : (questionnaireApp ? 'Mettre à jour mes réponses' : 'Soumettre ma candidature') }}
            </button>
          </form>
        }
      </div>
    }
  `
})
export class SessionsExplorerComponent implements OnInit {
  sessions: Session[] = [];
  myApps: Application[] = [];
  loading = true;
  submitting = false;

  // Questionnaire state
  questionnaireSession: Session | null = null;
  questionnaireApp: Application | null = null;
  questions: SessionQuestion[] = [];
  answers: Record<number, string> = {};
  questionsLoading = false;
  submitError = '';
  submitSuccess = false;
  answeredSessions = new Set<number>();

  constructor(
    private sessionService: SessionService,
    private appService: ApplicationService,
    private questionnaireService: QuestionnaireService,
    private router: Router
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.sessionService.getSessions().subscribe(r => {
      this.sessions = r.data || [];
      this.loading = false;
    });
    this.appService.getMyApplications().subscribe(r => {
      this.myApps = r.data || [];
      // Check which sessions already have submitted answers
      this.myApps.forEach(app => {
        this.questionnaireService.hasAnswered(app.sessionId).subscribe(res => {
          if (res.data) this.answeredSessions.add(app.sessionId);
        });
      });
    });
  }

  getMyApp(sessionId: number): Application | undefined {
    return this.myApps.find(a => a.sessionId === sessionId);
  }

  needsQuestionnaire(sessionId: number): boolean {
    return !this.answeredSessions.has(sessionId);
  }

  canSubmitProject(app: Application): boolean {
    return app.status.startsWith('ACCEPTED');
  }

  openSubmission(s: Session, app: Application) {
    this.router.navigate(['/candidate/projects/new'], { queryParams: { sessionId: s.id } });
  }

  openQuestionnaire(s: Session, app: Application | null) {
    this.questionnaireSession = s;
    this.questionnaireApp = app;
    this.answers = {};
    this.submitError = '';
    this.submitSuccess = false;
    this.questionsLoading = true;
    this.questionnaireService.getQuestionnaire(s.id).subscribe(r => {
      this.questions = r.data || [];
      this.questionsLoading = false;
    });
  }

  closeQuestionnaire() {
    this.questionnaireSession = null;
    this.questionnaireApp = null;
  }

  getOptions(q: SessionQuestion): string[] {
    return q.options ? q.options.split(',').map(o => o.trim()) : [];
  }

  isChecked(questionId: number, option: string): boolean {
    const val = this.answers[questionId] || '';
    return val.split(',').map(s => s.trim()).includes(option);
  }

  onCheckbox(event: Event, questionId: number, option: string) {
    const checked = (event.target as HTMLInputElement).checked;
    let values = (this.answers[questionId] || '').split(',').map(s => s.trim()).filter(Boolean);
    if (checked) {
      values.push(option);
    } else {
      values = values.filter(v => v !== option);
    }
    this.answers[questionId] = values.join(', ');
  }

  onFileChange(event: Event, questionId: number) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.answers[questionId] = file.name; // Store file name as placeholder
  }

  submitQuestionnaire() {
    if (!this.questionnaireSession) return;
    // Validate required fields
    const missing = this.questions.filter(q => q.required && !this.answers[q.id]);
    if (missing.length > 0) {
      this.submitError = `Veuillez répondre aux questions obligatoires : ${missing.map(q => q.label).join(', ')}`;
      return;
    }
    this.submitting = true;
    this.submitError = '';
    this.questionnaireService.submitAnswers(this.questionnaireSession.id, this.answers).subscribe({
      next: () => {
        this.submitting = false;
        this.submitSuccess = true;
        this.answeredSessions.add(this.questionnaireSession!.id);
        this.load(); // Refresh applications
        setTimeout(() => {
          this.closeQuestionnaire();
          this.router.navigate(['/candidate/applications']);
        }, 1500);
      },
      error: (err) => {
        this.submitting = false;
        this.submitError = err.error?.message || 'Erreur lors de la soumission.';
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
    if (s === 'PENDING') return 'En attente';
    if (s === 'COMPLETED') return 'Parcours terminé';
    if (s === 'REJECTED') return 'Rejeté';
    const acc = s.match(/ACCEPTED_ROUND_(\d+)/);
    if (acc) return 'Admis au Round ' + acc[1];
    const elim = s.match(/ELIMINATED_ROUND_(\d+)/);
    if (elim) return 'Éliminé au Round ' + elim[1];
    return s;
  }
}

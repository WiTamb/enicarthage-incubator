import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../../core/services/session.service';
import { Session, SessionStatus } from '../../../core/models/session.model';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal.component';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-eval-sessions',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ConfirmModalComponent],
  template: `
    <!-- ==================== ADMIN VIEW ==================== -->
    @if (isAdmin) {
      <div class="flex items-center justify-between mb-8">
        <div><h1 class="page-title">Sessions d'Incubation</h1><p class="page-subtitle">Gerez les sessions d'incubation avec leurs rounds.</p></div>
        <button (click)="openCreate()" class="btn-primary btn-sm">+ Nouvelle session</button>
      </div>

      <div class="table-container">
        <table class="w-full">
          <thead><tr class="table-header">
            <th class="px-6 py-4">Nom</th><th class="px-6 py-4">Dates</th><th class="px-6 py-4">Statut</th>
            <th class="px-6 py-4">Rounds</th><th class="px-6 py-4">Candidats</th><th class="px-6 py-4">Actions</th>
          </tr></thead>
          <tbody>
            @for (s of sessions; track s.id) {
              <tr class="table-row">
                <td class="px-6 py-4 font-medium">{{ s.name }}</td>
                <td class="px-6 py-4 text-sm text-text-secondary">{{ s.startDate | date:'dd/MM' }} - {{ s.endDate | date:'dd/MM/yy' }}</td>
                <td class="px-6 py-4"><span [class]="statusBadge(s.status)">{{ statusLabel(s.status) }}</span></td>
                <td class="px-6 py-4 text-sm">{{ s.rounds?.length || 0 }}</td>
                <td class="px-6 py-4 text-sm">{{ s.totalApplicants || 0 }}</td>
                <td class="px-6 py-4">
                  <div class="flex gap-1">
                    <a [routerLink]="['/admin/sessions', s.id]" class="btn-ghost btn-sm text-xs">Details</a>
                    <button (click)="openEdit(s)" class="btn-ghost btn-sm text-xs">Modifier</button>
                    <button (click)="delTarget = s" class="btn-ghost btn-sm text-xs text-danger-500">Suppr</button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Admin: Create/Edit slide-over -->
      @if (showForm) {
        <div class="overlay" (click)="showForm = false"></div>
        <div class="slide-over p-8">
          <h2 class="text-xl font-bold mb-6">{{ editId ? 'Modifier' : 'Nouvelle' }} session</h2>
          <form (ngSubmit)="save()" class="space-y-5">
            <div class="form-group"><label class="label">Nom</label><input class="input" [(ngModel)]="fd.name" name="name" required></div>
            <div class="form-group"><label class="label">Description</label><textarea class="input min-h-[100px]" [(ngModel)]="fd.description" name="desc"></textarea></div>
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group"><label class="label">Date debut</label><input type="date" class="input" [(ngModel)]="fd.startDate" name="sd" required></div>
              <div class="form-group"><label class="label">Date fin</label><input type="date" class="input" [(ngModel)]="fd.endDate" name="ed" required></div>
            </div>
            <div class="form-group">
              <label class="label">Statut</label>
              <select class="input" [(ngModel)]="fd.status" name="st">
                <option value="OPEN">Ouvert</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="CLOSED">Termine</option>
              </select>
            </div>

            <div class="border-t border-slate-100 pt-6 mt-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-bold text-text-primary uppercase tracking-wider">Rounds</h3>
                <button type="button" (click)="addRound()" class="btn-ghost btn-xs text-primary-600">+ Ajouter Round</button>
              </div>
              <div class="space-y-4">
                @for (r of fd.rounds; track $index) {
                  <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative">
                    <button type="button" (click)="removeRound($index)" class="absolute top-2 right-2 text-text-muted hover:text-danger-500 text-xs">x</button>
                    <div class="grid grid-cols-2 gap-3 mb-3">
                      <input class="input bg-white text-sm" [(ngModel)]="r.name" [name]="'rname-' + $index" placeholder="Nom (ex: Round 1)" required>
                      <select class="input bg-white text-sm" [(ngModel)]="r.status" [name]="'rst-' + $index">
                        <option value="UPCOMING">A venir</option>
                        <option value="ACTIVE">En cours</option>
                        <option value="COMPLETED">Termine</option>
                      </select>
                    </div>
                    <div class="space-y-2">
                      <label class="text-[10px] font-bold text-text-muted uppercase">Evaluateurs</label>
                      <div class="flex flex-wrap gap-2">
                        @for (ev of allEvaluators; track ev.id) {
                          <label class="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-100 cursor-pointer hover:border-primary-300 transition-all">
                            <input type="checkbox"
                                   [checked]="isEvChecked(r, ev.id)"
                                   (change)="toggleEv(r, ev.id)"
                                   class="w-3 h-3 rounded text-primary-600">
                            <span class="text-[10px]">{{ ev.firstName }} {{ ev.lastName }}</span>
                          </label>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <button type="submit" class="btn-primary btn-md w-full mt-4">Enregistrer</button>
          </form>
        </div>
      }

      <app-confirm-modal
        [open]="!!delTarget"
        title="Supprimer cette session ?"
        [message]="'La session ' + (delTarget?.name || '') + ' sera supprimee.'"
        confirmText="Supprimer"
        type="danger"
        (confirm)="doDelete()"
        (cancel)="delTarget = null"
      />
    }

    <!-- ==================== EVALUATOR VIEW ==================== -->
    @if (!isAdmin) {
      <div class="mb-8">
        <h1 class="page-title">Mes Sessions</h1>
        <p class="page-subtitle">Sessions auxquelles vous etes assigne pour evaluer.</p>
      </div>

      @if (sessions.length === 0) {
        <div class="card p-12 text-center">
          <svg class="w-16 h-16 text-slate-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          <p class="text-text-secondary mb-2">Aucune session ne vous est assignee.</p>
          <p class="text-xs text-text-muted">Contactez l'administrateur pour etre assigne a une session.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          @for (s of sessions; track s.id) {
            <div class="card overflow-hidden">
              <div class="h-1.5" [class]="s.status === 'OPEN' ? 'bg-gradient-to-r from-success-400 to-success-500' : s.status === 'IN_PROGRESS' ? 'bg-gradient-to-r from-primary-400 to-primary-500' : 'bg-slate-300'"></div>
              <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h3 class="font-bold text-lg text-text-primary">{{ s.name }}</h3>
                    <p class="text-xs text-text-muted mt-1">{{ s.startDate | date:'dd/MM/yyyy' }} - {{ s.endDate | date:'dd/MM/yyyy' }}</p>
                  </div>
                  <span [class]="statusBadge(s.status)">{{ statusLabel(s.status) }}</span>
                </div>

                @if (s.description) {
                  <p class="text-sm text-text-secondary mb-4 line-clamp-2">{{ s.description }}</p>
                }

                <!-- Rounds assigned to this evaluator -->
                <div class="space-y-3">
                  <h4 class="text-[10px] font-bold text-text-muted uppercase tracking-widest">Vos rounds a evaluer</h4>
                  @for (r of s.rounds; track r.id; let i = $index) {
                    <div class="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-primary-200 transition-all">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                             [class]="r.status === 'COMPLETED' ? 'bg-success-100 text-success-600' : r.status === 'ACTIVE' ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-text-muted'">
                          {{ r.orderIndex || (i + 1) }}
                        </div>
                        <div>
                          <p class="text-sm font-medium text-text-primary">{{ r.name }}</p>
                          <p class="text-[10px] text-text-muted">{{ r.status === 'ACTIVE' ? 'En cours' : r.status === 'COMPLETED' ? 'Termine' : 'A venir' }}</p>
                        </div>
                      </div>
                      <a [routerLink]="['/evaluator/sessions', s.id, 'rounds', r.id, 'applicants']"
                         class="btn-primary btn-xs">
                        Voir candidats
                      </a>
                    </div>
                  }
                  @if (!s.rounds?.length) {
                    <p class="text-xs text-text-muted text-center py-4">Aucun round assigne.</p>
                  }
                </div>

                <!-- Quick stats -->
                <div class="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50">
                  <span class="text-xs text-text-muted">{{ s.rounds?.length || 0 }} round(s)</span>
                  <span class="text-xs text-text-muted">{{ s.totalApplicants || 0 }} candidat(s)</span>
                  <a [routerLink]="['/evaluator/sessions', s.id]" class="text-xs text-primary-600 font-medium ml-auto hover:underline">Voir details</a>
                </div>
              </div>
            </div>
          }
        </div>
      }
    }
  `
})
export class EvalSessionsComponent implements OnInit {
  sessions: Session[] = [];
  allEvaluators: any[] = [];
  showForm = false;
  editId: number | null = null;
  fd: any = { name: '', description: '', startDate: '', endDate: '', status: 'OPEN', rounds: [] };
  delTarget: Session | null = null;
  basePath = '/evaluator';
  isAdmin = false;

  constructor(
    private svc: SessionService,
    private router: Router,
    private auth: AuthService,
    private userSvc: UserService
  ) {}

  ngOnInit() {
    this.isAdmin = this.auth.userRole() === Role.ADMIN;
    this.basePath = this.router.url.startsWith('/admin') ? '/admin' : '/evaluator';
    this.load();
  }

  load() {
    this.svc.getSessions().subscribe(r => this.sessions = r.data || []);
    if (this.isAdmin) {
      this.userSvc.getEvaluators().subscribe(r => this.allEvaluators = r.data || []);
    }
  }

  // ---- Admin round management ----
  addRound() {
    this.fd.rounds.push({
      name: 'Round ' + (this.fd.rounds.length + 1),
      description: '',
      orderIndex: this.fd.rounds.length + 1,
      status: 'UPCOMING',
      evaluatorIds: []
    });
  }

  removeRound(index: number) {
    this.fd.rounds.splice(index, 1);
  }

  isEvChecked(round: any, evId: number): boolean {
    return round.evaluatorIds?.includes(evId) || false;
  }

  toggleEv(round: any, evId: number) {
    if (!round.evaluatorIds) round.evaluatorIds = [];
    const idx = round.evaluatorIds.indexOf(evId);
    if (idx > -1) round.evaluatorIds.splice(idx, 1);
    else round.evaluatorIds.push(evId);
  }

  openCreate() {
    this.editId = null;
    this.fd = { name: '', description: '', startDate: '', endDate: '', status: 'OPEN', rounds: [] };
    this.showForm = true;
  }

  openEdit(s: Session) {
    this.editId = s.id;
    this.fd = {
      name: s.name,
      description: s.description,
      startDate: s.startDate?.substring(0, 10),
      endDate: s.endDate?.substring(0, 10),
      status: s.status,
      rounds: s.rounds?.map((r: any) => ({
        name: r.name,
        description: r.description,
        orderIndex: r.orderIndex,
        status: r.status,
        evaluatorIds: r.evaluators?.map((e: any) => e.id) || []
      })) || []
    };
    this.showForm = true;
  }

  save() {
    const obs = this.editId
      ? this.svc.updateSession(this.editId, this.fd)
      : this.svc.createSession(this.fd);
    obs.subscribe({
      next: () => {
        this.showForm = false;
        this.load();
      },
      error: (err: any) => {
        console.error('Save failed:', err);
        alert('Erreur: ' + (err.error?.message || err.message || 'Erreur serveur'));
      }
    });
  }

  doDelete() {
    if (this.delTarget) {
      this.svc.deleteSession(this.delTarget.id).subscribe(() => {
        this.delTarget = null;
        this.load();
      });
    }
  }

  // ---- Shared helpers ----
  statusBadge(s: SessionStatus) {
    return s === 'OPEN' ? 'badge-success' : s === 'IN_PROGRESS' ? 'badge-primary' : 'badge-slate';
  }

  statusLabel(s: SessionStatus) {
    return s === 'OPEN' ? 'Ouvert' : s === 'IN_PROGRESS' ? 'En cours' : 'Termine';
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SessionService } from '../../../core/services/session.service';
import { Session } from '../../../core/models/session.model';

@Component({
  selector: 'app-evaluator-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <h1 class="page-title mb-2">Tableau de bord</h1>
    <p class="page-subtitle mb-8">Aperçu de vos évaluations et sessions d'incubation.</p>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      <div class="stat-card">
        <div class="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
        </div>
        <div><p class="text-2xl font-bold">{{ sessions.length }}</p><p class="text-sm text-text-secondary">Sessions assignées</p></div>
      </div>
      <div class="stat-card">
        <div class="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
        </div>
        <div><p class="text-2xl font-bold">{{ totalRounds }}</p><p class="text-sm text-text-secondary">Rounds à évaluer</p></div>
      </div>
      <div class="stat-card">
        <div class="w-12 h-12 rounded-2xl bg-success-50 flex items-center justify-center flex-shrink-0">
          <svg class="w-6 h-6 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
        </div>
        <div><p class="text-2xl font-bold">{{ totalCandidatures }}</p><p class="text-sm text-text-secondary">Candidatures totales</p></div>
      </div>
    </div>

    <h2 class="text-lg font-semibold mb-4">Mes Sessions Récentes</h2>
    <div class="table-container">
      <table class="w-full">
        <thead><tr class="table-header">
          <th class="px-6 py-4 text-left">Session</th>
          <th class="px-6 py-4 text-left">Statut</th>
          <th class="px-6 py-4 text-center">Rounds assignés</th>
          <th class="px-6 py-4 text-center">Candidats</th>
          <th class="px-6 py-4 text-right">Action</th>
        </tr></thead>
        <tbody>
          @for (s of sessions; track s.id) {
            <tr class="table-row">
              <td class="px-6 py-4">
                <p class="font-bold text-sm text-text-primary">{{ s.name }}</p>
                <p class="text-xs text-text-muted">{{ s.startDate | date:'dd/MM' }} - {{ s.endDate | date:'dd/MM/yyyy' }}</p>
              </td>
              <td class="px-6 py-4">
                <span class="badge" [class.badge-success]="s.status === 'OPEN'" [class.badge-primary]="s.status === 'IN_PROGRESS'">
                  {{ s.status === 'OPEN' ? 'Ouverte' : s.status === 'IN_PROGRESS' ? 'En cours' : 'Terminée' }}
                </span>
              </td>
              <td class="px-6 py-4 text-center text-sm font-medium">{{ s.rounds.length || 0 }}</td>
              <td class="px-6 py-4 text-center text-sm font-medium">{{ s.totalApplicants || 0 }}</td>
              <td class="px-6 py-4 text-right">
                <a [routerLink]="['/evaluator/sessions', s.id]" class="btn-primary btn-sm text-[10px] px-3 py-1">Ouvrir</a>
              </td>
            </tr>
          }
          @if (sessions.length === 0) {
            <tr>
              <td colspan="5" class="px-6 py-12 text-center text-text-muted italic">
                Aucune session ne vous a été assignée.
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `
})
export class EvaluatorDashboardComponent implements OnInit {
  sessions: Session[] = [];
  
  get totalRounds() { return this.sessions.reduce((acc, s) => acc + (s.rounds?.length || 0), 0); }
  get totalCandidatures() { return this.sessions.reduce((acc, s) => acc + (s.totalApplicants || 0), 0); }

  constructor(private sessionService: SessionService) {}

  ngOnInit() { 
    this.sessionService.getSessions().subscribe(r => { 
      if (r.success) this.sessions = r.data || []; 
    }); 
  }
}


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApplicationService } from '../../../core/services/application.service';
import { Application } from '../../../core/models/session.model';

@Component({
  selector: 'app-candidate-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Welcome Hero -->
    <div class="rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-8 mb-8 text-white relative overflow-hidden">
      <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 80% 20%, white 1px, transparent 1px); background-size: 24px 24px;"></div>
      <div class="relative">
        <h1 class="text-2xl font-bold font-display">Bienvenue, {{ auth.currentUser()?.firstName }}</h1>
        <p class="text-primary-100 mt-1 text-sm">Suivez vos candidatures et l'avancement de votre parcours d'incubation.</p>
        <div class="mt-5 flex gap-3">
          <a routerLink="/candidate/sessions" class="inline-flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-sm font-medium transition-colors backdrop-blur-sm border border-white/20">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            Explorer les sessions
          </a>
          <a routerLink="/candidate/applications" class="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary-700 rounded-xl text-sm font-semibold hover:bg-primary-50 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            Mes candidatures
          </a>
        </div>
      </div>
    </div>

    <!-- KPI Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <!-- Total -->
      <div class="card p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        </div>
        <div>
          <p class="text-2xl font-black text-text-primary">{{ apps.length }}</p>
          <p class="text-xs text-text-muted font-medium">Total candidatures</p>
        </div>
      </div>
      <!-- Pending -->
      <div class="card p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-warning-50 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div>
          <p class="text-2xl font-black text-warning-600">{{ pendingCount }}</p>
          <p class="text-xs text-text-muted font-medium">En attente</p>
        </div>
      </div>
      <!-- Accepted -->
      <div class="card p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-success-50 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div>
          <p class="text-2xl font-black text-success-600">{{ acceptedCount }}</p>
          <p class="text-xs text-text-muted font-medium">Acceptées</p>
        </div>
      </div>
      <!-- Rejected -->
      <div class="card p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-danger-50 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div>
          <p class="text-2xl font-black text-danger-600">{{ rejectedCount }}</p>
          <p class="text-xs text-text-muted font-medium">Rejetées / Éliminées</p>
        </div>
      </div>
    </div>

    <!-- Recent Applications Table -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-text-primary">Mes Candidatures récentes</h2>
      <a routerLink="/candidate/applications" class="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors">
        Voir toutes
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
      </a>
    </div>

    @if (loading) {
      <div class="space-y-3">
        @for (i of [1,2,3]; track i) {
          <div class="card p-5 animate-pulse flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0"></div>
            <div class="flex-1"><div class="h-4 bg-slate-100 rounded w-1/3 mb-2"></div><div class="h-3 bg-slate-50 rounded w-1/4"></div></div>
            <div class="w-20 h-6 bg-slate-100 rounded-full"></div>
          </div>
        }
      </div>
    } @else if (apps.length === 0) {
      <div class="card p-12 text-center">
        <div class="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-5">
          <svg class="w-10 h-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        </div>
        <p class="text-text-secondary font-medium mb-1">Aucune candidature en cours</p>
        <p class="text-xs text-text-muted mb-5">Postulez à une session ouverte pour commencer votre parcours d'incubation.</p>
        <a routerLink="/candidate/sessions" class="btn-primary btn-sm inline-flex">
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          Découvrir les sessions
        </a>
      </div>
    } @else {
      <div class="space-y-3">
        @for (app of apps.slice(0, 5); track app.id) {
          <div class="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group">
            <!-- Icon -->
            <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" [class]="iconBg(app.status)">
              <svg class="w-5 h-5" [class]="iconColor(app.status)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            </div>
            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-text-primary truncate">{{ app.sessionName }}</p>
              <p class="text-xs text-text-muted mt-0.5">
                {{ app.currentRoundName || 'Candidature initiale' }} • Postulé le {{ app.appliedAt | date:'dd/MM/yyyy' }}
              </p>
            </div>
            <!-- Status badge -->
            <span class="px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap flex-shrink-0" [class]="statusChip(app.status)">
              {{ statusShort(app.status) }}
            </span>
            <!-- Arrow -->
            <a routerLink="/candidate/applications" class="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-primary-600">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
            </a>
          </div>
        }
        @if (apps.length > 5) {
          <a routerLink="/candidate/applications" class="card p-4 flex items-center justify-center gap-2 text-sm text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer font-medium">
            Voir les {{ apps.length - 5 }} autres candidatures →
          </a>
        }
      </div>
    }
  `
})
export class CandidateDashboardComponent implements OnInit {
  apps: Application[] = [];
  loading = true;

  constructor(public auth: AuthService, private appService: ApplicationService) {}

  ngOnInit() {
    this.appService.getMyApplications().subscribe(r => {
      this.apps = r.data || [];
      this.loading = false;
    });
  }

  get pendingCount() { return this.apps.filter(a => a.status === 'PENDING').length; }
  get acceptedCount() { return this.apps.filter(a => a.status.startsWith('ACCEPTED') || a.status === 'COMPLETED').length; }
  get rejectedCount() { return this.apps.filter(a => a.status === 'REJECTED' || a.status.startsWith('ELIMINATED')).length; }

  iconBg(s: string) {
    if (s === 'PENDING') return 'bg-warning-50';
    if (s.startsWith('ACCEPTED') || s === 'COMPLETED') return 'bg-success-50';
    if (s === 'REJECTED' || s.startsWith('ELIMINATED')) return 'bg-danger-50';
    return 'bg-primary-50';
  }
  iconColor(s: string) {
    if (s === 'PENDING') return 'text-warning-500';
    if (s.startsWith('ACCEPTED') || s === 'COMPLETED') return 'text-success-500';
    if (s === 'REJECTED' || s.startsWith('ELIMINATED')) return 'text-danger-500';
    return 'text-primary-600';
  }
  statusChip(s: string) {
    if (s === 'PENDING') return 'bg-warning-100 text-warning-700';
    if (s.startsWith('ACCEPTED') || s === 'COMPLETED') return 'bg-success-100 text-success-700';
    if (s === 'REJECTED' || s.startsWith('ELIMINATED')) return 'bg-danger-100 text-danger-700';
    return 'bg-primary-100 text-primary-700';
  }
  statusShort(s: string) {
    if (s === 'PENDING') return 'En attente';
    if (s === 'COMPLETED') return 'Terminé';
    if (s === 'REJECTED') return 'Rejeté';
    const acc = s.match(/ACCEPTED_ROUND_(\d+)/);
    if (acc) return `Round ${acc[1]}`;
    const elim = s.match(/ELIMINATED_ROUND_(\d+)/);
    if (elim) return `Éliminé R${elim[1]}`;
    return s;
  }
}


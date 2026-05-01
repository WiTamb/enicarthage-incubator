import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../../../core/services/stats.service';
import { DashboardStats } from '../../../core/models/index';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1 class="page-title mb-2">Dashboard</h1>
    <p class="page-subtitle mb-8">Vue d'ensemble de la plateforme.</p>

    @if (stats) {
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="stat-card"><div class="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center flex-shrink-0"><svg class="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg></div><div><p class="text-2xl font-bold">{{ stats.totalUsers }}</p><p class="text-sm text-text-secondary">Utilisateurs</p></div></div>
        <div class="stat-card"><div class="w-12 h-12 rounded-2xl bg-accent-50 flex items-center justify-center flex-shrink-0"><svg class="w-6 h-6 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg></div><div><p class="text-2xl font-bold">{{ stats.totalProjects }}</p><p class="text-sm text-text-secondary">Projets</p></div></div>
        <div class="stat-card"><div class="w-12 h-12 rounded-2xl bg-success-50 flex items-center justify-center flex-shrink-0"><svg class="w-6 h-6 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div><div><p class="text-2xl font-bold">{{ stats.acceptedProjects }}</p><p class="text-sm text-text-secondary">Acceptés</p></div></div>
        <div class="stat-card"><div class="w-12 h-12 rounded-2xl bg-warning-50 flex items-center justify-center flex-shrink-0"><svg class="w-6 h-6 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg></div><div><p class="text-2xl font-bold">{{ stats.activePrograms }}</p><p class="text-sm text-text-secondary">Programmes actifs</p></div></div>
      </div>

      <!-- Charts row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="card p-6">
          <h3 class="font-semibold mb-4">Statut des projets</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between"><span class="text-sm text-text-secondary">Soumis</span><div class="flex items-center gap-2"><div class="h-2 rounded-full bg-primary-500" [style.width.px]="bar(stats.submittedProjects)"></div><span class="text-sm font-medium">{{ stats.submittedProjects }}</span></div></div>
            <div class="flex items-center justify-between"><span class="text-sm text-text-secondary">En revue</span><div class="flex items-center gap-2"><div class="h-2 rounded-full bg-warning-500" [style.width.px]="bar(stats.underReviewProjects)"></div><span class="text-sm font-medium">{{ stats.underReviewProjects }}</span></div></div>
            <div class="flex items-center justify-between"><span class="text-sm text-text-secondary">Acceptés</span><div class="flex items-center gap-2"><div class="h-2 rounded-full bg-success-500" [style.width.px]="bar(stats.acceptedProjects)"></div><span class="text-sm font-medium">{{ stats.acceptedProjects }}</span></div></div>
            <div class="flex items-center justify-between"><span class="text-sm text-text-secondary">Rejetés</span><div class="flex items-center gap-2"><div class="h-2 rounded-full bg-danger-500" [style.width.px]="bar(stats.rejectedProjects)"></div><span class="text-sm font-medium">{{ stats.rejectedProjects }}</span></div></div>
          </div>
        </div>
        <div class="card p-6">
          <h3 class="font-semibold mb-4">Répartition des utilisateurs</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between"><span class="text-sm text-text-secondary">Étudiants</span><div class="flex items-center gap-2"><div class="h-2 rounded-full bg-primary-500" [style.width.px]="barUsers(stats.totalStudents)"></div><span class="text-sm font-medium">{{ stats.totalStudents }}</span></div></div>
            <div class="flex items-center justify-between"><span class="text-sm text-text-secondary">Évaluateurs</span><div class="flex items-center gap-2"><div class="h-2 rounded-full bg-accent-500" [style.width.px]="barUsers(stats.totalEvaluators)"></div><span class="text-sm font-medium">{{ stats.totalEvaluators }}</span></div></div>
            <div class="flex items-center justify-between"><span class="text-sm text-text-secondary">Total évaluations</span><span class="text-sm font-medium">{{ stats.totalEvaluations }}</span></div>
          </div>
        </div>
      </div>
    } @else {
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        @for (i of [1,2,3,4]; track i) {
          <div class="card p-6 animate-pulse"><div class="h-4 bg-slate-200 rounded w-20 mb-3"></div><div class="h-8 bg-slate-200 rounded w-16"></div></div>
        }
      </div>
    }
  `
})
export class AdminDashboardComponent implements OnInit {
  stats?: DashboardStats;
  constructor(private statsService: StatsService) {}
  ngOnInit() { this.statsService.getDashboardStats().subscribe(r => { if (r.success) this.stats = r.data; }); }
  bar(v: number) { return Math.max(20, Math.min(200, (v / Math.max(1, this.stats?.totalProjects || 1)) * 200)); }
  barUsers(v: number) { return Math.max(20, Math.min(200, (v / Math.max(1, this.stats?.totalUsers || 1)) * 200)); }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Navbar -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span class="text-lg font-bold text-text-primary font-display">ENICarthage <span class="text-primary-600">Incubator</span></span>
          </a>

          <!-- Nav links -->
          <div class="hidden md:flex items-center gap-8">
            <a routerLink="/" routerLinkActive="text-primary-600" [routerLinkActiveOptions]="{exact: true}" class="text-sm font-medium text-text-secondary hover:text-primary-600 transition-colors">Accueil</a>
            <a href="#programs" class="text-sm font-medium text-text-secondary hover:text-primary-600 transition-colors">Programmes</a>
            <a href="#events" class="text-sm font-medium text-text-secondary hover:text-primary-600 transition-colors">Événements</a>
            <a href="#news" class="text-sm font-medium text-text-secondary hover:text-primary-600 transition-colors">Actualités</a>
          </div>

          <!-- CTA -->
          <div class="flex items-center gap-3">
            @if (auth.isAuthenticated()) {
              <a [routerLink]="auth.getHomeRoute()" class="btn-primary btn-sm">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
                Dashboard
              </a>
            } @else {
              <a routerLink="/login" class="btn-ghost btn-sm">Connexion</a>
              <a routerLink="/register" class="btn-primary btn-sm">S'inscrire</a>
            }
          </div>
        </div>
      </div>
    </nav>

    <!-- Content -->
    <main class="pt-16">
      <router-outlet></router-outlet>
    </main>

    <!-- Footer -->
    <footer class="bg-navy-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-10">
          <!-- Brand -->
          <div class="col-span-1">
            <div class="flex items-center gap-2.5 mb-4">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <span class="text-lg font-bold font-display">ENICarthage Incubator</span>
            </div>
            <p class="text-slate-400 text-sm leading-relaxed">Transformer vos idées innovantes en startups à succès.</p>
          </div>

          <!-- Links -->
          <div>
            <h4 class="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">Plateforme</h4>
            <ul class="space-y-2.5">
              <li><a href="#" class="text-sm text-slate-400 hover:text-white transition-colors">Programmes</a></li>
              <li><a href="#" class="text-sm text-slate-400 hover:text-white transition-colors">Événements</a></li>
              <li><a href="#" class="text-sm text-slate-400 hover:text-white transition-colors">Actualités</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">Candidat</h4>
            <ul class="space-y-2.5">
              <li><a routerLink="/register" class="text-sm text-slate-400 hover:text-white transition-colors">S'inscrire</a></li>
              <li><a routerLink="/login" class="text-sm text-slate-400 hover:text-white transition-colors">Se connecter</a></li>
              <li><a href="#" class="text-sm text-slate-400 hover:text-white transition-colors">Soumettre un projet</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">Contact</h4>
            <ul class="space-y-2.5">
              <li class="text-sm text-slate-400">ENICarthage, Tunisie</li>
              <li class="text-sm text-slate-400">contact&#64;enicarthage.tn</li>
              <li class="text-sm text-slate-400">+216 71 000 000</li>
            </ul>
          </div>
        </div>
        <div class="border-t border-slate-800 mt-12 pt-8 text-center">
          <p class="text-sm text-slate-500">&copy; 2026 ENICarthage Incubator. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  `
})
export class PublicLayoutComponent {
  constructor(public auth: AuthService) {}
}

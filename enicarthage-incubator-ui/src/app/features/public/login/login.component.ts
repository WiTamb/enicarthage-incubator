import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen flex relative">
      <!-- Back to home button -->
      <a routerLink="/" class="absolute top-6 left-6 z-10 flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 hover:bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full font-medium text-sm">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        Retour à l'accueil
      </a>

      <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-navy-900 relative items-center justify-center p-12">
        <div class="relative text-center max-w-md">
          <div class="bg-white rounded-[2.5rem] p-10 shadow-2xl mx-auto mb-12 max-w-[360px] flex items-center justify-center ring-8 ring-white/10 transition-transform duration-500 hover:-translate-y-2">
            <img src="assets/images/logo2.png" alt="Incubateur ENICarthage" class="w-full h-auto object-contain drop-shadow-sm rounded-xl">
          </div>
          <h2 class="text-3xl font-bold text-white font-display mb-4">Bienvenue</h2>
          <p class="text-primary-100 text-lg">"L'innovation distingue un leader d'un suiveur."</p>
          <p class="text-primary-200 text-sm mt-2">— Steve Jobs</p>
        </div>
      </div>
      <div class="flex-1 flex items-center justify-center p-8 bg-background">
        <div class="w-full max-w-md">
          <h1 class="text-2xl font-bold text-text-primary font-display mb-2">Connexion</h1>
          <p class="text-text-secondary mb-8">Connectez-vous pour accéder à votre espace.</p>
          @if (error) {
            <div class="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-xl text-sm text-danger-700">{{ error }}</div>
          }
          <form (ngSubmit)="onSubmit()" class="space-y-5">
            <div class="form-group">
              <label class="label" for="email">Email</label>
              <input id="email" type="email" class="input" [(ngModel)]="form.email" name="email" placeholder="votre&#64;email.com" required>
            </div>
            <div class="form-group">
              <label class="label" for="password">Mot de passe</label>
              <input id="password" [type]="showPw ? 'text' : 'password'" class="input" [(ngModel)]="form.password" name="password" placeholder="••••••••" required>
            </div>
            <button type="submit" class="btn-primary btn-md w-full" [disabled]="loading">
              @if (loading) { <span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> }
              Se connecter
            </button>
          </form>
          <p class="mt-8 text-center text-sm text-text-secondary">
            Pas encore de compte ? <a routerLink="/register" class="text-primary-600 font-semibold hover:text-primary-700">S'inscrire</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  form: LoginRequest = { email: '', password: '' };
  loading = false; error = ''; showPw = false;
  constructor(private authService: AuthService, private router: Router) {}
  onSubmit() {
    this.loading = true; this.error = '';
    this.authService.login(this.form).subscribe({
      next: r => { this.loading = false; if (r.success) this.router.navigate([this.authService.getHomeRoute()]); else this.error = r.message; },
      error: e => { this.loading = false; this.error = e.error?.message || 'Erreur de connexion'; }
    });
  }
}

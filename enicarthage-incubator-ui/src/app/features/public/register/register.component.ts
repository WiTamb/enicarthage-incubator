import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen flex">
      <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent-500 via-primary-600 to-navy-900 relative items-center justify-center p-12">
        <div class="relative text-center max-w-md">
          <div class="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-8">
            <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
          </div>
          <h2 class="text-3xl font-bold text-white font-display mb-4">Rejoignez-nous</h2>
          <p class="text-primary-100 text-lg">Créez votre compte et soumettez votre premier projet.</p>
        </div>
      </div>
      <div class="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <div class="w-full max-w-md">
          <h1 class="text-2xl font-bold text-text-primary font-display mb-2">Inscription</h1>
          <p class="text-text-secondary mb-8">Créez votre compte candidat.</p>
          @if (error) {
            <div class="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-xl text-sm text-danger-700">{{ error }}</div>
          }
          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="label">Prénom</label>
                <input type="text" class="input" [(ngModel)]="form.firstName" name="firstName" required>
              </div>
              <div class="form-group">
                <label class="label">Nom</label>
                <input type="text" class="input" [(ngModel)]="form.lastName" name="lastName" required>
              </div>
            </div>
            <div class="form-group">
              <label class="label">Email</label>
              <input type="email" class="input" [(ngModel)]="form.email" name="email" required>
            </div>
            <div class="form-group">
              <label class="label">Mot de passe (min. 8 caractères)</label>
              <input type="password" class="input" [(ngModel)]="form.password" name="password" minlength="8" required>
            </div>
            <div class="form-group">
              <label class="label">Téléphone</label>
              <input type="tel" class="input" [(ngModel)]="form.phone" name="phone">
            </div>
            <div class="form-group">
              <label class="label">Spécialité</label>
              <input type="text" class="input" [(ngModel)]="form.specialty" name="specialty">
            </div>
            <button type="submit" class="btn-primary btn-md w-full mt-2" [disabled]="loading">
              @if (loading) { <span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> }
              Créer mon compte
            </button>
          </form>
          <p class="mt-6 text-center text-sm text-text-secondary">
            Déjà un compte ? <a routerLink="/login" class="text-primary-600 font-semibold hover:text-primary-700">Se connecter</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  form: RegisterRequest = { firstName: '', lastName: '', email: '', password: '' };
  loading = false; error = '';
  constructor(private authService: AuthService, private router: Router) {}
  onSubmit() {
    this.loading = true; this.error = '';
    this.authService.register(this.form).subscribe({
      next: r => { this.loading = false; if (r.success) this.router.navigate([this.authService.getHomeRoute()]); else this.error = r.message; },
      error: e => { this.loading = false; this.error = e.error?.message || 'Erreur lors de l\'inscription'; }
    });
  }
}

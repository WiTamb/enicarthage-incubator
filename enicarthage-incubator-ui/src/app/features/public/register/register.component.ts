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
                <label class="label">Prénom <span class="text-danger-500">*</span></label>
                <input type="text" class="input" [(ngModel)]="form.firstName" name="firstName" required>
              </div>
              <div class="form-group">
                <label class="label">Nom <span class="text-danger-500">*</span></label>
                <input type="text" class="input" [(ngModel)]="form.lastName" name="lastName" required>
              </div>
            </div>
            <div class="form-group">
              <label class="label">Email <span class="text-danger-500">*</span></label>
              <input type="email" class="input" [(ngModel)]="form.email" name="email" required>
            </div>
            
            <div class="form-group">
              <label class="label">Mot de passe <span class="text-danger-500">*</span></label>
              <input type="password" class="input" [(ngModel)]="form.password" name="password" minlength="8" required>
              <p class="text-xs text-text-muted mt-1">Min 8 caractères, 1 lettre, 1 chiffre, 1 caractère spécial.</p>
            </div>
            <div class="form-group">
              <label class="label">Confirmer le mot de passe <span class="text-danger-500">*</span></label>
              <input type="password" class="input" [(ngModel)]="confirmPassword" name="confirmPassword" required>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="label">Téléphone <span class="text-danger-500">*</span></label>
                <input type="tel" class="input" [(ngModel)]="form.phone" name="phone" required>
              </div>
              <div class="form-group">
                <label class="label">Spécialité</label>
                <input type="text" class="input" [(ngModel)]="form.specialty" name="specialty">
              </div>
            </div>
            <button type="submit" class="btn-primary btn-md w-full mt-4" [disabled]="loading">
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
  form: RegisterRequest = { firstName: '', lastName: '', email: '', password: '', phone: '', specialty: '' };
  confirmPassword = '';
  loading = false; 
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.error = '';

    if (!this.form.firstName || !this.form.lastName || !this.form.email || !this.form.password || !this.form.phone || !this.confirmPassword) {
      this.error = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.])[A-Za-z\d@$!%*#?&.]{8,}$/;
    if (!passwordRegex.test(this.form.password)) {
      this.error = 'Le mot de passe doit contenir au moins 8 caractères, une lettre, un chiffre et un caractère spécial.';
      return;
    }

    if (this.form.password !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.loading = true;
    this.authService.register(this.form).subscribe({
      next: r => { 
        this.loading = false; 
        if (r.success) {
          this.router.navigate([this.authService.getHomeRoute()]); 
        } else {
          this.error = r.message; 
        }
      },
      error: e => { 
        this.loading = false; 
        this.error = e.error?.message || 'Erreur lors de l\'inscription'; 
      }
    });
  }
}

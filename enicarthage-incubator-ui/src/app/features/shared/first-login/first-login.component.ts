import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-first-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <h1 class="text-2xl font-black text-slate-800">Complétez votre profil</h1>
          <p class="text-sm text-slate-500 mt-2">C'est votre première connexion. Veuillez configurer votre compte avant de continuer.</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label class="label text-xs font-bold text-slate-600 uppercase tracking-wider">Prénom <span class="text-danger-500">*</span></label>
              <input type="text" class="input bg-slate-50 border-slate-200 focus:bg-white focus:border-primary-500 transition-colors" [(ngModel)]="form.firstName" name="firstName" required>
            </div>
            <div class="form-group">
              <label class="label text-xs font-bold text-slate-600 uppercase tracking-wider">Nom <span class="text-danger-500">*</span></label>
              <input type="text" class="input bg-slate-50 border-slate-200 focus:bg-white focus:border-primary-500 transition-colors" [(ngModel)]="form.lastName" name="lastName" required>
            </div>
          </div>

          <div class="form-group">
            <label class="label text-xs font-bold text-slate-600 uppercase tracking-wider">Spécialité (Optionnel)</label>
            <input type="text" class="input bg-slate-50 border-slate-200 focus:bg-white focus:border-primary-500 transition-colors" [(ngModel)]="form.specialty" name="specialty">
          </div>

          <div class="form-group">
            <label class="label text-xs font-bold text-slate-600 uppercase tracking-wider">Nouveau Mot de Passe <span class="text-danger-500">*</span></label>
            <input type="password" class="input bg-slate-50 border-slate-200 focus:bg-white focus:border-primary-500 transition-colors" [(ngModel)]="form.password" name="password" required minlength="6">
          </div>
          
          <div class="form-group">
            <label class="label text-xs font-bold text-slate-600 uppercase tracking-wider">Confirmer le Mot de Passe <span class="text-danger-500">*</span></label>
            <input type="password" class="input bg-slate-50 border-slate-200 focus:bg-white focus:border-primary-500 transition-colors" [(ngModel)]="form.confirmPassword" name="confirmPassword" required>
          </div>

          @if (error) {
            <div class="bg-danger-50 text-danger-600 text-sm p-3 rounded-lg flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {{ error }}
            </div>
          }

          <button type="submit" class="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-primary-500/30 transition-all duration-200" [disabled]="submitting">
            {{ submitting ? 'Enregistrement...' : 'Enregistrer et Continuer' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class FirstLoginComponent implements OnInit {
  form = { firstName: '', lastName: '', specialty: '', password: '', confirmPassword: '' };
  submitting = false;
  error = '';

  constructor(private userService: UserService, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    // If not first login, redirect to dashboard
    const user = this.auth.currentUser();
    if (!user || !user.firstLogin) {
      this.redirectBasedOnRole(user?.role);
    }
  }

  onSubmit() {
    this.error = '';
    if (!this.form.firstName || !this.form.lastName || !this.form.password) {
      this.error = 'Veuillez remplir les champs obligatoires.';
      return;
    }
    if (this.form.password !== this.form.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas.';
      return;
    }
    if (this.form.password.length < 6) {
      this.error = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    this.submitting = true;
    this.userService.completeProfile(this.form).subscribe({
      next: (r) => {
        // Update local storage token data to reflect firstLogin=false
        const currentUser = this.auth.currentUser();
        if (currentUser) {
          currentUser.firstLogin = false;
          localStorage.setItem('user', JSON.stringify(currentUser));
        }
        alert('Profil configuré avec succès !');
        this.redirectBasedOnRole(currentUser?.role);
      },
      error: (err) => {
        this.error = err.error?.message || 'Une erreur est survenue.';
        this.submitting = false;
      }
    });
  }

  private redirectBasedOnRole(role?: string) {
    if (role === 'ADMIN') this.router.navigate(['/admin']);
    else if (role === 'EVALUATOR') this.router.navigate(['/evaluator']);
    else this.router.navigate(['/candidate']);
  }
}

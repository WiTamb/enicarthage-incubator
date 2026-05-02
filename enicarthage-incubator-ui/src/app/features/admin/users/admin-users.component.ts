import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { User, Role } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center justify-between mb-8">
      <div><h1 class="page-title">Utilisateurs</h1><p class="page-subtitle">Gérez les comptes utilisateurs.</p></div>
      <button (click)="openInviteModal()" class="btn-primary flex items-center justify-center gap-2 px-5 py-2.5 text-sm">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        <span>Inviter un Évaluateur</span>
      </button>
    </div>
    <div class="card p-4 mb-6">
      <input class="input max-w-sm" placeholder="Rechercher un utilisateur..." [(ngModel)]="search">
    </div>
    <div class="table-container">
      <table class="w-full">
        <thead><tr class="table-header">
          <th class="px-6 py-4 text-left">Utilisateur</th><th class="px-6 py-4 text-left">Email</th><th class="px-6 py-4 text-left">Rôle</th><th class="px-6 py-4 text-left">Statut</th><th class="px-6 py-4 text-left">Actions</th>
        </tr></thead>
        <tbody>
          @for (u of filtered; track u.id) {
            <tr class="table-row">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">{{ u.firstName.charAt(0) }}{{ u.lastName.charAt(0) }}</div>
                  <span class="font-medium">{{ u.firstName }} {{ u.lastName }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-text-secondary">{{ u.email }}</td>
              <td class="px-6 py-4">
                <select class="input py-1.5 px-2 text-xs w-32" [ngModel]="u.role" (ngModelChange)="changeRole(u.id, $event)" [disabled]="u.email === currentUserEmail">
                  <option value="STUDENT">Candidat</option>
                  <option value="EVALUATOR">Évaluateur</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </td>
              <td class="px-6 py-4">
                @if (u.blocked) { <span class="badge-danger">Bloqué</span> }
                @else { <span class="badge-success">Actif</span> }
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <button (click)="toggleBlock(u)" class="btn-ghost btn-sm text-xs">{{ u.blocked ? 'Débloquer' : 'Bloquer' }}</button>
                  <button (click)="deleteUser(u)" class="btn-ghost btn-sm text-xs text-danger-500 hover:text-danger-700">Supprimer</button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <!-- Invite Modal -->
    @if (showInviteModal) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold">Inviter un Évaluateur</h2>
            <button (click)="showInviteModal = false" class="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-2 transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <form (ngSubmit)="inviteEvaluator()">
            <div class="form-group mb-6">
              <label class="label block text-sm font-semibold text-slate-700 mb-2">Adresse Email</label>
              <input type="email" class="input w-full bg-slate-50 border-slate-200 focus:bg-white focus:border-primary-500" [(ngModel)]="inviteEmail" name="email" required placeholder="ex: expert@gmail.com">
            </div>
            <button type="submit" class="btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2" [disabled]="inviting">
              @if (inviting) {
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Envoi en cours...
              } @else {
                Envoyer l'invitation
              }
            </button>
          </form>
        </div>
      </div>
    }
  `
})
export class AdminUsersComponent implements OnInit {
  users: User[] = []; search = '';
  showInviteModal = false;
  inviteEmail = '';
  inviting = false;
  currentUserEmail = '';

  get filtered() { const s = this.search.toLowerCase(); return this.users.filter(u => (u.firstName + u.lastName + u.email).toLowerCase().includes(s)); }
  constructor(private userService: UserService, private authService: AuthService) {
    this.currentUserEmail = this.authService.currentUser()?.email || '';
  }
  ngOnInit() { this.load(); }
  load() { this.userService.getAllUsers().subscribe(r => { if (r.success) this.users = r.data || []; }); }
  toggleBlock(u: User) { this.userService.toggleBlock(u.id).subscribe(() => this.load()); }
  changeRole(id: number, role: Role) { this.userService.changeRole(id, role).subscribe(() => this.load()); }
  deleteUser(u: User) { if (confirm('Supprimer ' + u.firstName + ' ?')) this.userService.deleteUser(u.id).subscribe(() => this.load()); }

  openInviteModal() {
    this.inviteEmail = '';
    this.showInviteModal = true;
  }

  inviteEvaluator() {
    if (!this.inviteEmail) return;
    this.inviting = true;
    this.userService.inviteEvaluator(this.inviteEmail).subscribe({
      next: () => {
        alert('Invitation envoyée avec succès à ' + this.inviteEmail);
        this.inviting = false;
        this.showInviteModal = false;
        this.load();
      },
      error: (err) => {
        alert(err.error?.message || "Erreur lors de l'invitation");
        this.inviting = false;
      }
    });
  }
}

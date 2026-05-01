import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { User, Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center justify-between mb-8">
      <div><h1 class="page-title">Utilisateurs</h1><p class="page-subtitle">Gérez les comptes utilisateurs.</p></div>
    </div>
    <div class="card p-4 mb-6">
      <input class="input max-w-sm" placeholder="Rechercher un utilisateur..." [(ngModel)]="search">
    </div>
    <div class="table-container">
      <table class="w-full">
        <thead><tr class="table-header">
          <th class="px-6 py-4">Utilisateur</th><th class="px-6 py-4">Email</th><th class="px-6 py-4">Rôle</th><th class="px-6 py-4">Statut</th><th class="px-6 py-4">Actions</th>
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
                <select class="input py-1.5 px-2 text-xs w-32" [ngModel]="u.role" (ngModelChange)="changeRole(u.id, $event)">
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
  `
})
export class AdminUsersComponent implements OnInit {
  users: User[] = []; search = '';
  get filtered() { const s = this.search.toLowerCase(); return this.users.filter(u => (u.firstName + u.lastName + u.email).toLowerCase().includes(s)); }
  constructor(private userService: UserService) {}
  ngOnInit() { this.load(); }
  load() { this.userService.getAllUsers().subscribe(r => { if (r.success) this.users = r.data || []; }); }
  toggleBlock(u: User) { this.userService.toggleBlock(u.id).subscribe(() => this.load()); }
  changeRole(id: number, role: Role) { this.userService.changeRole(id, role).subscribe(() => this.load()); }
  deleteUser(u: User) { if (confirm('Supprimer ' + u.firstName + ' ?')) this.userService.deleteUser(u.id).subscribe(() => this.load()); }
}

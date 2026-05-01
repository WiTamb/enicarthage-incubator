import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="page-title mb-2">Mon Profil</h1>
    <p class="page-subtitle mb-8">Gérez vos informations personnelles.</p>
    @if (user) {
      <div class="card p-8 max-w-2xl">
        <form (ngSubmit)="save()" class="space-y-5">
          <div class="grid grid-cols-2 gap-4">
            <div class="form-group"><label class="label">Prénom</label><input class="input" [(ngModel)]="user.firstName" name="fn"></div>
            <div class="form-group"><label class="label">Nom</label><input class="input" [(ngModel)]="user.lastName" name="ln"></div>
          </div>
          <div class="form-group"><label class="label">Email</label><input class="input bg-slate-50" [value]="user.email" disabled></div>
          <div class="form-group"><label class="label">Téléphone</label><input class="input" [(ngModel)]="user.phone" name="phone"></div>
          <div class="form-group"><label class="label">Spécialité</label><input class="input" [(ngModel)]="user.specialty" name="spec"></div>
          <div class="form-group"><label class="label">Compétences</label><input class="input" [(ngModel)]="user.skills" name="skills"></div>
          <div class="form-group"><label class="label">Bio</label><textarea class="input min-h-[100px]" [(ngModel)]="user.bio" name="bio"></textarea></div>
          <button type="submit" class="btn-primary btn-sm" [disabled]="saving">
            @if (saving) { <span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> }
            Enregistrer
          </button>
          @if (msg) { <p class="text-sm text-success-600 mt-2">{{ msg }}</p> }
        </form>
      </div>
    }
  `
})
export class ProfileComponent implements OnInit {
  user?: User; saving = false; msg = '';
  constructor(private userService: UserService) {}
  ngOnInit() { this.userService.getProfile().subscribe(r => { if (r.success) this.user = r.data; }); }
  save() {
    if (!this.user) return;
    this.saving = true; this.msg = '';
    this.userService.updateProfile(this.user).subscribe({
      next: r => { this.saving = false; if (r.success) { this.user = r.data; this.msg = 'Profil mis à jour !'; } },
      error: () => { this.saving = false; }
    });
  }
}

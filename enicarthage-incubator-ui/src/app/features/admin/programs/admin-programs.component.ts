import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgramService } from '../../../core/services/program.service';
import { Program, Round } from '../../../core/models/project.model';

@Component({
  selector: 'app-admin-programs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center justify-between mb-8">
      <div><h1 class="page-title">Programmes</h1><p class="page-subtitle">Gérez les programmes d'incubation.</p></div>
      <button (click)="showForm = true; editId = null; formData = {name:'',description:'',active:true}" class="btn-primary btn-sm">+ Nouveau programme</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      @for (p of programs; track p.id) {
        <div class="card p-6">
          <div class="flex justify-between items-start mb-3">
            <h3 class="font-semibold">{{ p.name }}</h3>
            @if (p.active) { <span class="badge-success">Actif</span> } @else { <span class="badge-slate">Inactif</span> }
          </div>
          <p class="text-sm text-text-secondary mb-4 line-clamp-2">{{ p.description }}</p>
          <div class="flex gap-2">
            <button (click)="edit(p)" class="btn-ghost btn-sm text-xs">Modifier</button>
            <button (click)="del(p.id)" class="btn-ghost btn-sm text-xs text-danger-500">Supprimer</button>
          </div>
        </div>
      }
    </div>

    @if (showForm) {
      <div class="overlay" (click)="showForm = false"></div>
      <div class="slide-over p-8">
        <h2 class="text-xl font-bold mb-6">{{ editId ? 'Modifier' : 'Nouveau' }} programme</h2>
        <form (ngSubmit)="save()" class="space-y-5">
          <div class="form-group"><label class="label">Nom</label><input class="input" [(ngModel)]="formData.name" name="name" required></div>
          <div class="form-group"><label class="label">Description</label><textarea class="input min-h-[100px]" [(ngModel)]="formData.description" name="desc"></textarea></div>
          <div class="flex items-center gap-2">
            <input type="checkbox" [(ngModel)]="formData.active" name="active" id="active" class="rounded">
            <label for="active" class="text-sm">Actif</label>
          </div>
          <button type="submit" class="btn-primary btn-md w-full">Enregistrer</button>
        </form>
      </div>
    }
  `
})
export class AdminProgramsComponent implements OnInit {
  programs: Program[] = [];
  showForm = false; editId: number | null = null;
  formData: any = { name: '', description: '', active: true };
  constructor(private svc: ProgramService) {}
  ngOnInit() { this.load(); }
  load() { this.svc.getAllPrograms().subscribe(r => { if (r.success) this.programs = r.data || []; }); }
  edit(p: Program) { this.editId = p.id; this.formData = { name: p.name, description: p.description, active: p.active }; this.showForm = true; }
  save() {
    const obs = this.editId ? this.svc.updateProgram(this.editId, this.formData) : this.svc.createProgram(this.formData);
    obs.subscribe(() => { this.showForm = false; this.load(); });
  }
  del(id: number) { if (confirm('Supprimer ?')) this.svc.deleteProgram(id).subscribe(() => this.load()); }
}

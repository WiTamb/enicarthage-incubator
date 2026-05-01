import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { ProgramService } from '../../../core/services/program.service';
import { ProjectRequest, Program, Round } from '../../../core/models/project.model';

@Component({
  selector: 'app-project-submit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h1 class="page-title mb-2">Soumettre un projet</h1>
    <p class="page-subtitle mb-8">Remplissez les informations ci-dessous pour soumettre votre projet.</p>

    <!-- Steps -->
    <div class="flex items-center gap-2 mb-8">
      @for (s of steps; track s; let i = $index) {
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
               [class]="step > i ? 'bg-success-500 text-white' : step === i ? 'bg-primary-600 text-white' : 'bg-slate-100 text-text-muted'">
            @if (step > i) { ✓ } @else { {{ i + 1 }} }
          </div>
          <span class="text-sm font-medium hidden sm:inline" [class]="step === i ? 'text-primary-600' : 'text-text-muted'">{{ s }}</span>
          @if (i < steps.length - 1) { <div class="w-8 h-px bg-slate-200"></div> }
        </div>
      }
    </div>

    <div class="card p-8">
      <!-- Step 0: Info -->
      @if (step === 0) {
        <div class="space-y-5 max-w-xl">
          <div class="form-group">
            <label class="label">Titre du projet *</label>
            <input class="input" [(ngModel)]="form.title" placeholder="Mon projet innovant">
          </div>
          <div class="form-group">
            <label class="label">Description *</label>
            <textarea class="input min-h-[120px]" [(ngModel)]="form.description" placeholder="Décrivez votre projet..."></textarea>
          </div>
          <div class="form-group">
            <label class="label">Domaine</label>
            <input class="input" [(ngModel)]="form.domain" placeholder="IoT, IA, FinTech...">
          </div>
          <div class="form-group">
            <label class="label">Programme *</label>
            <select class="input" [(ngModel)]="form.programId" (ngModelChange)="onProgramChange()">
              <option [ngValue]="0" disabled>Choisir un programme</option>
              @for (p of programs; track p.id) {
                <option [ngValue]="p.id">{{ p.name }}</option>
              }
            </select>
          </div>
          @if (rounds.length) {
            <div class="form-group">
              <label class="label">Round</label>
              <select class="input" [(ngModel)]="form.roundId">
                <option [ngValue]="undefined">Aucun</option>
                @for (r of rounds; track r.id) {
                  <option [ngValue]="r.id">{{ r.name }}</option>
                }
              </select>
            </div>
          }
        </div>
      }

      <!-- Step 1: Team -->
      @if (step === 1) {
        <div class="space-y-5 max-w-xl">
          <div class="form-group">
            <label class="label">Membres de l'équipe</label>
            <input class="input" [(ngModel)]="form.teamMembers" placeholder="Noms séparés par des virgules">
          </div>
          <div class="form-group">
            <label class="label">URL Vidéo (optionnel)</label>
            <input class="input" [(ngModel)]="form.videoUrl" placeholder="https://youtube.com/...">
          </div>
        </div>
      }

      <!-- Step 2: Files -->
      @if (step === 2) {
        <div class="space-y-6 max-w-xl">
          <div>
            <label class="label mb-2">Document (PDF)</label>
            <div class="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer" (click)="docInput.click()">
              <input #docInput type="file" accept=".pdf" class="hidden" (change)="onDocFile($event)">
              @if (docFile) {
                <p class="text-sm text-success-600 font-medium">✓ {{ docFile.name }}</p>
              } @else {
                <svg class="w-10 h-10 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                <p class="text-sm text-text-muted">Cliquez pour sélectionner un PDF</p>
              }
            </div>
          </div>
          <div>
            <label class="label mb-2">Image du projet</label>
            <div class="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer" (click)="imgInput.click()">
              <input #imgInput type="file" accept="image/*" class="hidden" (change)="onImgFile($event)">
              @if (imgFile) {
                <p class="text-sm text-success-600 font-medium">✓ {{ imgFile.name }}</p>
              } @else {
                <p class="text-sm text-text-muted">Cliquez pour sélectionner une image</p>
              }
            </div>
          </div>
        </div>
      }

      <!-- Step 3: Review -->
      @if (step === 3) {
        <div class="space-y-4 max-w-xl">
          <h3 class="text-lg font-semibold text-text-primary">Résumé</h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div><span class="text-text-muted">Titre:</span></div><div class="font-medium">{{ form.title }}</div>
            <div><span class="text-text-muted">Domaine:</span></div><div>{{ form.domain || '—' }}</div>
            <div><span class="text-text-muted">Équipe:</span></div><div>{{ form.teamMembers || '—' }}</div>
            <div><span class="text-text-muted">Document:</span></div><div>{{ docFile?.name || 'Aucun' }}</div>
            <div><span class="text-text-muted">Image:</span></div><div>{{ imgFile?.name || 'Aucune' }}</div>
          </div>
          <div><span class="text-text-muted text-sm">Description:</span><p class="text-sm mt-1">{{ form.description }}</p></div>
        </div>
      }

      <!-- Navigation -->
      <div class="flex justify-between mt-8 pt-6 border-t border-slate-100">
        <button (click)="step = step - 1" class="btn-ghost btn-sm" [class.invisible]="step === 0">← Précédent</button>
        @if (step < 3) {
          <button (click)="step = step + 1" class="btn-primary btn-sm" [disabled]="!canNext()">Suivant →</button>
        } @else {
          <button (click)="submit()" class="btn-accent btn-sm" [disabled]="loading">
            @if (loading) { <span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> }
            Soumettre le projet
          </button>
        }
      </div>
    </div>
  `
})
export class ProjectSubmitComponent implements OnInit {
  steps = ['Informations', 'Équipe', 'Documents', 'Confirmation'];
  step = 0;
  form: ProjectRequest = { title: '', description: '', programId: 0 };
  programs: Program[] = [];
  rounds: Round[] = [];
  docFile?: File;
  imgFile?: File;
  loading = false;

  constructor(private projectService: ProjectService, private programService: ProgramService, private router: Router) {}

  ngOnInit() {
    this.programService.getActivePrograms().subscribe(r => { if (r.success) this.programs = r.data || []; });
  }

  onProgramChange() {
    if (this.form.programId) {
      this.programService.getRoundsByProgram(this.form.programId).subscribe(r => { this.rounds = r.data || []; });
    }
  }

  onDocFile(e: any) { this.docFile = e.target.files[0]; }
  onImgFile(e: any) { this.imgFile = e.target.files[0]; }
  canNext() { return this.step !== 0 || (this.form.title && this.form.description && this.form.programId); }

  submit() {
    this.loading = true;
    this.projectService.submitProject(this.form, this.docFile, this.imgFile).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/candidate']); },
      error: () => { this.loading = false; }
    });
  }
}

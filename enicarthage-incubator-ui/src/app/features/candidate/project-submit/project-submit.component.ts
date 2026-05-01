import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { ApplicationService } from '../../../core/services/application.service';
import { ProjectRequest } from '../../../core/models/project.model';
import { Application } from '../../../core/models/session.model';

@Component({
  selector: 'app-project-submit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <h1 class="page-title mb-2">Soumettre un projet</h1>
    <p class="page-subtitle mb-8">Remplissez les informations ci-dessous pour soumettre votre projet.</p>

    @if (checkingApplication) {
      <div class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    } @else if (!activeApplication) {
      <div class="card p-12 text-center max-w-2xl mx-auto">
        <div class="w-20 h-20 bg-danger-50 text-danger-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
        </div>
        <h2 class="text-xl font-bold mb-4">Accès restreint</h2>
        <p class="text-text-muted mb-8">
          Vous ne pouvez pas soumettre de projet pour le moment. La soumission de projet nécessite d'avoir une candidature active dans une session d'incubation ouverte.
        </p>
        <div class="flex justify-center gap-4">
          <a routerLink="/candidate/sessions" class="btn-primary">Explorer les sessions</a>
          <a routerLink="/candidate" class="btn-ghost">Retour au tableau de bord</a>
        </div>
      </div>
    } @else {
      <!-- Current Round Info -->
      <div class="card p-4 mb-8 bg-primary-50 border-primary-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-white rounded-lg shadow-sm">
            <svg class="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <p class="text-xs font-semibold text-primary-700 uppercase tracking-wider">Session active</p>
            <p class="text-sm font-medium">{{ activeApplication.sessionName }} — <span class="text-primary-600">{{ activeApplication.currentRoundName || 'Round 1 (Pré-sélection)' }}</span></p>
          </div>
        </div>
        <span class="text-xs font-medium text-primary-600 bg-white px-3 py-1.5 rounded-full shadow-sm">
          Round {{ activeApplication.currentRoundIndex || 1 }} / 3
        </span>
      </div>

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
              <input class="input" [(ngModel)]="form.title" placeholder="Ex: Application de gestion de déchets">
            </div>
            <div class="form-group">
              <label class="label">Description du projet *</label>
              <textarea class="input min-h-[150px]" [(ngModel)]="form.description" placeholder="Décrivez les objectifs, la problématique et votre solution..."></textarea>
            </div>
            <div class="form-group">
              <label class="label">Domaine d'innovation</label>
              <input class="input" [(ngModel)]="form.domain" placeholder="IoT, IA, Agriculture, FinTech...">
            </div>
          </div>
        }

        <!-- Step 1: Team -->
        @if (step === 1) {
          <div class="space-y-5 max-w-xl">
            <div class="form-group">
              <label class="label">Membres de l'équipe</label>
              <input class="input" [(ngModel)]="form.teamMembers" placeholder="Noms séparés par des virgules">
              <p class="helper-text">Listez les autres membres participant à ce projet.</p>
            </div>
            <div class="form-group">
              <label class="label">Lien vers une démo vidéo (optionnel)</label>
              <input class="input" [(ngModel)]="form.videoUrl" placeholder="https://youtube.com/watch?v=...">
            </div>
          </div>
        }

        <!-- Step 2: Files -->
        @if (step === 2) {
          <div class="space-y-6 max-w-xl">
            <div>
              <label class="label mb-2">Dossier technique / Business Plan (PDF) *</label>
              <div class="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer" (click)="docInput.click()">
                <input #docInput type="file" accept=".pdf" class="hidden" (change)="onDocFile($event)">
                @if (docFile) {
                  <div class="flex items-center justify-center gap-2 text-success-600">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span class="font-medium">{{ docFile.name }}</span>
                  </div>
                } @else {
                  <svg class="w-10 h-10 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                  <p class="text-sm text-text-muted">Cliquez pour téléverser votre document PDF</p>
                }
              </div>
            </div>
            <div>
              <label class="label mb-2">Image illustrative du projet</label>
              <div class="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer" (click)="imgInput.click()">
                <input #imgInput type="file" accept="image/*" class="hidden" (change)="onImgFile($event)">
                @if (imgFile) {
                  <div class="flex items-center justify-center gap-2 text-success-600">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span class="font-medium">{{ imgFile.name }}</span>
                  </div>
                } @else {
                  <p class="text-sm text-text-muted">Sélectionnez une image (PNG, JPG)</p>
                }
              </div>
            </div>
          </div>
        }

        <!-- Step 3: Review -->
        @if (step === 3) {
          <div class="space-y-6">
            <div class="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 class="text-lg font-bold text-text-primary">Récapitulatif de soumission</h3>
              <span class="badge-primary">Session: {{ activeApplication.sessionName }}</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div class="space-y-4">
                <div><label class="text-xs font-semibold text-text-muted uppercase tracking-wider">Titre</label><p class="text-sm font-medium">{{ form.title }}</p></div>
                <div><label class="text-xs font-semibold text-text-muted uppercase tracking-wider">Domaine</label><p class="text-sm font-medium">{{ form.domain || '—' }}</p></div>
                <div><label class="text-xs font-semibold text-text-muted uppercase tracking-wider">Équipe</label><p class="text-sm font-medium">{{ form.teamMembers || '—' }}</p></div>
              </div>
              <div class="space-y-4">
                <div><label class="text-xs font-semibold text-text-muted uppercase tracking-wider">Fichiers</label>
                  <p class="text-sm font-medium flex items-center gap-2 mt-1">
                    <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    {{ docFile?.name || 'Aucun document' }}
                  </p>
                </div>
                <div><label class="text-xs font-semibold text-text-muted uppercase tracking-wider">Description</label><p class="text-sm mt-1 text-text-muted italic line-clamp-3">{{ form.description }}</p></div>
              </div>
            </div>
          </div>
        }

        <!-- Navigation -->
        <div class="flex justify-between mt-12 pt-6 border-t border-slate-100">
          <button (click)="step = step - 1" class="btn-ghost" [class.invisible]="step === 0">← Précédent</button>
          @if (step < 3) {
            <button (click)="step = step + 1" class="btn-primary" [disabled]="!canNext()">Suivant →</button>
          } @else {
            <button (click)="submit()" class="btn-accent px-10" [disabled]="loading || !docFile">
              @if (loading) { <span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span> }
              Finaliser la soumission
            </button>
          }
        </div>
      </div>
    }
  `
})
export class ProjectSubmitComponent implements OnInit {
  steps = ['Détails', 'Équipe', 'Fichiers', 'Vérification'];
  step = 0;
  form: ProjectRequest = { title: '', description: '', programId: 0 };
  activeApplication: Application | null = null;
  checkingApplication = true;
  docFile?: File;
  imgFile?: File;
  loading = false;

  constructor(
    private projectService: ProjectService, 
    private applicationService: ApplicationService, 
    private router: Router
  ) {}

  ngOnInit() {
    this.applicationService.getMyApplications().subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.length > 0) {
          // Find the most recent active application that is in a valid state for submission
          this.activeApplication = res.data.find(a => 
            a.status === 'PENDING' || a.status.startsWith('ACCEPTED')
          ) || null;
          
          if (this.activeApplication) {
            this.form.programId = 0; 
          }
        }
        this.checkingApplication = false;
      },
      error: () => {
        this.checkingApplication = false;
      }
    });
  }

  onDocFile(e: any) { this.docFile = e.target.files[0]; }
  onImgFile(e: any) { this.imgFile = e.target.files[0]; }
  
  canNext() { 
    if (this.step === 0) return this.form.title && this.form.description;
    if (this.step === 2) return !!this.docFile;
    return true;
  }

  submit() {
    this.loading = true;
    this.projectService.submitProject(this.form, this.docFile, this.imgFile).subscribe({
      next: () => { 
        this.loading = false; 
        this.router.navigate(['/candidate/applications']); 
      },
      error: () => { 
        this.loading = false; 
      }
    });
  }
}

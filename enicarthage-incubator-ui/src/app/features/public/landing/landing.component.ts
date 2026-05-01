import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProgramService } from '../../../core/services/program.service';
import { EventService } from '../../../core/services/event.service';
import { NewsService } from '../../../core/services/news.service';
import { Program } from '../../../core/models/project.model';
import { Event, News } from '../../../core/models/index';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Hero -->
    <section class="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-b from-primary-50/50 to-background">
      <!-- Blobs -->
      <div class="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
      <div class="absolute top-40 right-10 w-72 h-72 bg-accent-200/30 rounded-full mix-blend-multiply filter blur-xl animate-blob" style="animation-delay: 2s;"></div>
      <div class="absolute bottom-20 left-1/3 w-72 h-72 bg-primary-100/30 rounded-full mix-blend-multiply filter blur-xl animate-blob" style="animation-delay: 4s;"></div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="text-center max-w-4xl mx-auto">
          <div class="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-4 py-1.5 mb-8">
            <span class="w-2 h-2 rounded-full bg-primary-500 animate-pulse-soft"></span>
            <span class="text-xs font-semibold text-primary-700">Incubateur de l'ENICarthage</span>
          </div>
          <h1 class="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-text-primary font-display leading-tight">
            Transformez vos
            <span class="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent"> idées innovantes</span>
            en réalité
          </h1>
          <p class="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Rejoignez l'incubateur d'ENICarthage et bénéficiez d'un accompagnement expert pour transformer votre projet étudiant en startup à succès.
          </p>
          <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a routerLink="/register" class="btn-primary btn-lg w-full sm:w-auto">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              Soumettre votre idée
            </a>
            <a href="#programs" class="btn-outline btn-lg w-full sm:w-auto">
              En savoir plus
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="py-16 bg-white border-y border-slate-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div class="text-center">
            <p class="text-4xl font-extrabold text-primary-600 font-display">150+</p>
            <p class="mt-2 text-sm text-text-secondary">Projets soumis</p>
          </div>
          <div class="text-center">
            <p class="text-4xl font-extrabold text-primary-600 font-display">25+</p>
            <p class="mt-2 text-sm text-text-secondary">Startups lancées</p>
          </div>
          <div class="text-center">
            <p class="text-4xl font-extrabold text-primary-600 font-display">40+</p>
            <p class="mt-2 text-sm text-text-secondary">Mentors experts</p>
          </div>
          <div class="text-center">
            <p class="text-4xl font-extrabold text-primary-600 font-display">500+</p>
            <p class="mt-2 text-sm text-text-secondary">Étudiants accompagnés</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Programs -->
    <section id="programs" class="py-24 bg-background">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="badge-primary mb-4">Programmes</span>
          <h2 class="text-3xl sm:text-4xl font-bold text-text-primary font-display">Nos programmes d'incubation</h2>
          <p class="mt-4 text-text-secondary max-w-2xl mx-auto">Découvrez nos programmes conçus pour accompagner les étudiants à chaque étape de leur parcours entrepreneurial.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          @for (program of programs; track program.id) {
            <div class="card overflow-hidden group">
              <div class="h-2 bg-gradient-to-r from-primary-500 to-accent-500"></div>
              <div class="p-6">
                <div class="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg class="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <h3 class="text-lg font-semibold text-text-primary mb-2">{{ program.name }}</h3>
                <p class="text-sm text-text-secondary leading-relaxed">{{ program.description || 'Programme d\\'incubation innovant pour les étudiants.' }}</p>
                @if (program.active) {
                  <span class="badge-success mt-4">Actif</span>
                } @else {
                  <span class="badge-slate mt-4">Terminé</span>
                }
              </div>
            </div>
          }
          @if (programs.length === 0) {
            <div class="col-span-3 text-center py-12">
              <p class="text-text-muted">Les programmes seront bientôt disponibles.</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Events -->
    <section id="events" class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="badge bg-accent-100 text-accent-700 mb-4">Événements</span>
          <h2 class="text-3xl sm:text-4xl font-bold text-text-primary font-display">Événements à venir</h2>
          <p class="mt-4 text-text-secondary max-w-2xl mx-auto">Participez à nos ateliers, workshops et événements de networking.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (event of events; track event.id) {
            <div class="card overflow-hidden group">
              <div class="h-48 bg-gradient-to-br from-primary-100 to-accent-50 flex items-center justify-center">
                <svg class="w-12 h-12 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
              <div class="p-6">
                @if (event.eventDate) {
                  <span class="badge-primary mb-3">{{ event.eventDate | date:'dd MMM yyyy' }}</span>
                }
                <h3 class="text-lg font-semibold text-text-primary mb-2">{{ event.title }}</h3>
                <p class="text-sm text-text-secondary line-clamp-2">{{ event.description }}</p>
                @if (event.location) {
                  <div class="flex items-center gap-1.5 mt-3 text-xs text-text-muted">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {{ event.location }}
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- News -->
    <section id="news" class="py-24 bg-background">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="badge-success mb-4">Actualités</span>
          <h2 class="text-3xl sm:text-4xl font-bold text-text-primary font-display">Dernières actualités</h2>
          <p class="mt-4 text-text-secondary max-w-2xl mx-auto">Restez informé des dernières nouvelles de l'incubateur.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          @for (item of news; track item.id; let i = $index) {
            <div class="card overflow-hidden" [class.md:col-span-2]="i === 0" [class.md:row-span-2]="i === 0">
              <div [class]="i === 0 ? 'h-64' : 'h-40'" class="bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                <svg class="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
              </div>
              <div class="p-6">
                @if (item.category) {
                  <span class="badge-slate mb-3">{{ item.category }}</span>
                }
                <h3 class="font-semibold text-text-primary mb-2" [class.text-xl]="i === 0">{{ item.title }}</h3>
                <p class="text-sm text-text-secondary line-clamp-3">{{ item.content }}</p>
                <p class="text-xs text-text-muted mt-3">{{ item.createdAt | date:'dd/MM/yyyy' }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-24 bg-gradient-to-r from-primary-600 to-primary-700">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h2 class="text-3xl sm:text-4xl font-bold text-white font-display">Prêt à lancer votre projet ?</h2>
        <p class="mt-4 text-primary-100 text-lg max-w-2xl mx-auto">Inscrivez-vous dès maintenant et commencez votre parcours entrepreneurial avec l'ENICarthage Incubator.</p>
        <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a routerLink="/register" class="btn bg-white text-primary-700 hover:bg-primary-50 btn-lg font-semibold shadow-lg">
            Créer mon compte
          </a>
          <a routerLink="/login" class="btn border-2 border-white/30 text-white hover:bg-white/10 btn-lg">
            J'ai déjà un compte
          </a>
        </div>
      </div>
    </section>
  `
})
export class LandingComponent implements OnInit {
  programs: Program[] = [];
  events: Event[] = [];
  news: News[] = [];

  constructor(
    private programService: ProgramService,
    private eventService: EventService,
    private newsService: NewsService
  ) {}

  ngOnInit() {
    this.programService.getActivePrograms().subscribe(res => {
      if (res.success) this.programs = res.data || [];
    });
    this.eventService.getPublishedEvents().subscribe(res => {
      if (res.success) this.events = (res.data || []).slice(0, 6);
    });
    this.newsService.getPublishedNews().subscribe(res => {
      if (res.success) this.news = (res.data || []).slice(0, 3);
    });
  }
}

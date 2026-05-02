import { Component, OnInit, OnDestroy } from '@angular/core';
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
    <!-- Hero Carousel -->
    <section class="relative w-full h-[80vh] overflow-hidden bg-navy-950">
      @for (slide of slides; track slide; let i = $index) {
        <div class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
             [class.opacity-100]="i === currentSlide"
             [class.z-10]="i === currentSlide"
             [class.opacity-0]="i !== currentSlide"
             [class.z-0]="i !== currentSlide">
          <img [src]="slide" class="w-full h-full object-cover opacity-60" alt="Incubator Event">
        </div>
      }
      
      <div class="absolute inset-0 z-20 flex flex-col items-center justify-center pt-32 text-center px-4">

        <h1 class="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white font-display leading-tight max-w-5xl drop-shadow-lg">
          Catalyzing <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-primary-600">Innovation</span><br/>
          Growing Ideas
        </h1>
        <p class="mt-6 text-xl text-slate-200 max-w-2xl font-light drop-shadow">
          From Engineering to Entrepreneurship. Transforming ideas into real projects and impactful startups.
        </p>
        <div class="mt-12 flex items-center gap-4">
          <a href="#about" class="btn bg-white text-navy-900 hover:bg-slate-100 btn-lg font-bold shadow-xl">
            Discover Our Story
          </a>
        </div>
      </div>

      <!-- Carousel Navigation -->
      <div class="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-3">
        @for (slide of slides; track slide; let i = $index) {
          <button (click)="setSlide(i)" 
                  [ngClass]="i === currentSlide ? 'bg-white scale-125' : 'bg-white/40'"
                  class="w-3 h-3 rounded-full transition-all duration-300">
          </button>
        }
      </div>
    </section>

    <!-- Highlight: Kickoff -->
    <section id="about" class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <span class="text-primary-600 font-bold tracking-wider uppercase text-sm mb-2 block">November 12, 2025</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-text-primary font-display mb-6">The Official Kickoff</h2>
            <div class="space-y-4 text-text-secondary text-lg leading-relaxed">
              <p>
                Today marks the official kickoff of the ENICARTHAGE Incubator, in the presence of our third- and second-year engineering students. A new chapter begins with this initiative, fully dedicated to supporting our students and researchers in transforming their ideas into real projects and impactful startups.
              </p>
              <p>
                The incubator brings together the school’s three engineering departments: Computer Engineering, Electrical Engineering, and Industrial Engineering, around one shared vision: <strong>Encouraging creativity, innovation, and entrepreneurship at the heart of engineering education.</strong>
              </p>
              <p>
                Through mentoring, training, and collaboration with business and industry partners, the ENICARTHAGE Incubator aims to create a dynamic ecosystem where ideas grow, talents connect, and innovation thrives. A first partnership agreement was signed with <strong>Mine’n Shine</strong> to strengthen collaboration with the socio-economic ecosystem.
              </p>
            </div>
          </div>
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-tr from-primary-100 to-accent-100 transform translate-x-4 translate-y-4 rounded-3xl -z-10"></div>
            <img src="assets/images/slide1.png" alt="Kickoff Day" class="rounded-3xl shadow-xl w-full object-cover h-[500px]">
          </div>
        </div>
      </div>
    </section>

    <!-- Highlight: First Cohort -->
    <section class="py-24 bg-background border-y border-slate-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center flex-col-reverse md:flex-row-reverse">
          <div class="order-1 md:order-2">
            <span class="text-accent-600 font-bold tracking-wider uppercase text-sm mb-2 block">January 24, 2026</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-text-primary font-display mb-6">The First Cohort</h2>
            <div class="space-y-4 text-text-secondary text-lg leading-relaxed">
              <p>
                It was a real pleasure to conclude the Final Round of the very first incubation session of the ENICARTHAGE Incubator. We were proud to see our finalists successfully complete this final stage after several months of structured evaluation, mentoring, and sustained effort.
              </p>
              <ul class="space-y-2 font-medium text-text-primary bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <li class="flex items-center gap-3">
                  <svg class="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd"/></svg>
                  First place: <strong>MAAMAR MOHAMED</strong>
                </li>
                <li class="flex items-center gap-3">
                  <svg class="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd"/></svg>
                  Second place: <strong>Moeness BELGACEM</strong>
                </li>
              </ul>
              <p>
                Following the jury’s deliberation, Mohamed Maamar will receive business and technical support in collaboration with <em>Mine'n Shine</em>. Moeness Belgacem will receive technical support with continued guidance.
              </p>
              <p>
                Less than three months after the official launch, we already have an active first cohort and a clear path forward. This milestone reflects our mission to translate engineering talent into entrepreneurial impact through structured incubation, mentorship, and real-world validation.
              </p>
            </div>
          </div>
          <div class="order-2 md:order-1 relative">
            <div class="absolute inset-0 bg-gradient-to-bl from-accent-100 to-primary-100 transform -translate-x-4 translate-y-4 rounded-3xl -z-10"></div>
            <img src="assets/images/slide2.png" alt="First Cohort Winners" class="rounded-3xl shadow-xl w-full object-cover h-[500px]">
          </div>
        </div>
      </div>
    </section>

    <!-- Jury & Acknowledgments -->
    <section class="py-24 bg-navy-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl sm:text-4xl font-bold font-display mb-16">Jury & Acknowledgments</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
          <div class="bg-navy-800 p-8 rounded-3xl border border-navy-700">
            <div class="mb-4">
              <svg class="w-10 h-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </div>
            <h3 class="text-2xl font-bold mb-4 text-primary-200">Our Jury</h3>
            <p class="text-slate-300 mb-6">We sincerely thank all jury members for their availability, commitment, valuable insights, and constructive feedback.</p>
            <div class="space-y-4 text-sm">
              <div>
                <strong class="text-white block mb-1">Final Round – January 24, 2026</strong>
                <span class="text-slate-400">Imane Channoufi, Mohamed KHADRAOUI, Walid Barhoumi, Houda Ben Attia</span><br/>
                <span class="text-slate-500">Supervisors: Nazeh Ben Ammar, Amor GUEDDANA, Besma Khiari, Monia Bouzid</span>
              </div>
              <div>
                <strong class="text-white block mb-1">Screening Round – December 3, 2025</strong>
                <span class="text-slate-400">Nazeh Ben Ammar, Houda Ben Attia, Besma Khiari, Haythem Ghazouani</span>
              </div>
              <div>
                <strong class="text-white block mb-1">Ideation Round – November 19, 2025</strong>
                <span class="text-slate-400">Nazeh Ben Ammar, Houda Ben Attia, Monia Bouzid, Amor GUEDDANA</span>
              </div>
            </div>
          </div>
          <div class="bg-navy-800 p-8 rounded-3xl border border-navy-700">
            <div class="mb-4">
              <svg class="w-10 h-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            </div>
            <h3 class="text-2xl font-bold mb-4 text-accent-200">Acknowledgments</h3>
            <p class="text-slate-300 mb-6 leading-relaxed">
              Special thanks to the founders of the ENICARTHAGE Incubator for their vision, trust, and continued commitment:
            </p>
            <p class="text-lg font-medium text-white leading-relaxed">
              Besma Khiari, Monia Bouzid, Houda Ben Attia, Imen Kammoun, Khaoula ElBedoui, Walid Barhoumi, Haythem Ghazouani, Iyed Ben Slimen, and Amor GUEDDANA.
            </p>
            <div class="mt-8 pt-8 border-t border-navy-700">
              <p class="text-slate-400 text-sm italic">
                The next incubation session will be open to additional institutions within the University of Carthage, to other universities across Tunisia, and potentially to international participants. We look forward to the next incubation cycle!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Events -->
    @if (events.length > 0) {
      <section id="events" class="py-24 bg-white border-b border-slate-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <span class="badge-primary mb-4 bg-primary-100 text-primary-700">Événements</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-text-primary font-display">À ne pas manquer</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (e of events; track e.id) {
              <div class="card overflow-hidden group flex flex-col h-full border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                <div class="p-6 flex flex-col h-full relative">
                  @if (e.registrationEnabled) {
                    <div class="absolute top-0 right-0 bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-bl-xl border-l border-b border-primary-200">
                      Inscriptions Ouvertes
                    </div>
                  }
                  <h3 class="text-xl font-bold text-slate-800 mb-3 pr-16">{{ e.title }}</h3>
                  <p class="text-sm text-slate-600 mb-6 line-clamp-3 whitespace-pre-line flex-grow">{{ e.description }}</p>
                  
                  <div class="space-y-2 mb-6 bg-slate-50 p-4 rounded-xl">
                    @if (e.eventDate) {
                      <div class="flex items-center text-sm text-slate-600 font-medium">
                        <svg class="w-5 h-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        {{ e.eventDate | date:'dd/MM/yyyy à HH:mm' }}
                      </div>
                    }
                    @if (e.location) {
                      <div class="flex items-center text-sm text-slate-600 font-medium">
                        <svg class="w-5 h-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        {{ e.location }}
                      </div>
                    }
                  </div>

                  @if (e.registrationEnabled) {
                    <div class="mt-auto">
                      <a routerLink="/login" class="btn-primary w-full text-center flex items-center justify-center">
                        S'inscrire (Candidat / Étudiant)
                        <svg class="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                      </a>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </section>
    }

    <!-- Programs -->
    <section id="programs" class="py-24 bg-background">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="badge-primary mb-4">Programmes</span>
          <h2 class="text-3xl sm:text-4xl font-bold text-text-primary font-display">Nos programmes d'incubation</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          @for (program of programs; track program.id) {
            <div class="card overflow-hidden group">
              <div class="h-2 bg-gradient-to-r from-primary-500 to-accent-500"></div>
              <div class="p-6">
                <h3 class="text-lg font-semibold text-text-primary mb-2">{{ program.name }}</h3>
                <p class="text-sm text-text-secondary leading-relaxed">{{ program.description || 'Programme d\\'incubation innovant pour les étudiants.' }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-24 bg-gradient-to-r from-primary-600 to-primary-700">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h2 class="text-3xl sm:text-4xl font-bold text-white font-display">Prêt à rejoindre l'aventure ?</h2>
        <p class="mt-4 text-primary-100 text-lg max-w-2xl mx-auto">Créez votre compte pour être prêt lors de la prochaine session d'incubation.</p>
        <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a routerLink="/register" class="btn bg-white text-primary-700 hover:bg-primary-50 btn-lg font-semibold shadow-lg">
            Créer mon compte
          </a>
        </div>
      </div>
    </section>
  `
})
export class LandingComponent implements OnInit, OnDestroy {
  programs: Program[] = [];
  events: Event[] = [];
  news: News[] = [];
  
  // Carousel logic
  slides = [
    'assets/images/slide1.png',
    'assets/images/slide2.png',
    'assets/images/slide3.png'
  ];
  currentSlide = 0;
  slideInterval: any;

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
      if (res.success) this.events = res.data || [];
    });
    
    // Start carousel
    this.startCarousel();
  }

  ngOnDestroy() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  startCarousel() {
    this.slideInterval = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    }, 5000);
  }

  setSlide(index: number) {
    this.currentSlide = index;
    // Reset interval when manually changing slide
    clearInterval(this.slideInterval);
    this.startCarousel();
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../core/services/event.service';
import { Event } from '../../../core/models/index';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-candidate-events',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-8">
      <h1 class="page-title">Événements à venir</h1>
      <p class="page-subtitle">Découvrez nos événements et confirmez votre présence.</p>
    </div>

    @if (loading) {
      <div class="flex items-center justify-center h-32">
        <div class="text-slate-400">Chargement...</div>
      </div>
    } @else if (events.length === 0) {
      <div class="card p-12 text-center">
        <div class="text-slate-400 mb-4">Aucun événement à venir pour le moment.</div>
      </div>
    } @else {
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        @for (e of events; track e.id) {
          <div class="card p-6 flex flex-col h-full relative overflow-hidden">
            @if (e.registrationEnabled) {
              <div class="absolute top-0 right-0 bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-bl-xl border-l border-b border-primary-200">
                Inscriptions Ouvertes
              </div>
            }
            <h3 class="font-bold text-lg mb-2 text-slate-800 pr-16">{{ e.title }}</h3>
            <p class="text-sm text-slate-600 mb-4 line-clamp-3 whitespace-pre-line flex-grow">{{ e.description }}</p>
            <div class="space-y-2 mb-6">
              @if (e.eventDate) {
                <div class="flex items-center text-sm text-slate-500 font-medium">
                  <svg class="w-4 h-4 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  {{ e.eventDate | date:'dd/MM/yyyy HH:mm' }}
                </div>
              }
              @if (e.location) {
                <div class="flex items-center text-sm text-slate-500 font-medium">
                  <svg class="w-4 h-4 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  {{ e.location }}
                </div>
              }
            </div>

            @if (e.registrationEnabled) {
              <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
                @if (registeredStatus[e.id]) {
                  <span class="text-sm font-bold text-success-600 flex items-center bg-success-50 px-3 py-1.5 rounded-lg">
                    <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                    Inscrit
                  </span>
                } @else if (participantCounts[e.id] !== undefined && e.maxParticipants && participantCounts[e.id] >= e.maxParticipants) {
                  <span class="text-sm font-bold text-danger-500 flex items-center bg-danger-50 px-3 py-1.5 rounded-lg">
                    <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Complet
                  </span>
                } @else {
                  <button (click)="register(e)" class="btn-primary btn-sm" [disabled]="registeringId === e.id">
                    {{ registeringId === e.id ? 'Inscription...' : 'Confirmer ma présence' }}
                  </button>
                }
                
                @if (e.maxParticipants && !registeredStatus[e.id]) {
                  <span class="text-xs font-medium text-slate-400">
                    {{ participantCounts[e.id] !== undefined ? participantCounts[e.id] : 0 }} / {{ e.maxParticipants }} places
                  </span>
                }
              </div>
            }
          </div>
        }
      </div>
    }
  `
})
export class CandidateEventsComponent implements OnInit {
  events: Event[] = [];
  loading = true;
  registeredStatus: { [key: number]: boolean } = {};
  participantCounts: { [key: number]: number } = {};
  registeringId: number | null = null;

  constructor(private eventService: EventService, private auth: AuthService) {}

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getPublishedEvents().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.events = res.data || [];
          this.loadRegistrationData();
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadRegistrationData() {
    this.events.forEach(e => {
      if (e.registrationEnabled) {
        this.eventService.checkRegistrationStatus(e.id).subscribe((res: any) => {
          if (res.success) this.registeredStatus[e.id] = res.data;
        });
        if (e.maxParticipants) {
          this.eventService.getEventParticipantCount(e.id).subscribe((res: any) => {
            if (res.success) this.participantCounts[e.id] = res.data;
          });
        }
      }
    });
  }

  register(e: Event) {
    this.registeringId = e.id;
    this.eventService.registerForEvent(e.id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.registeredStatus[e.id] = true;
          if (this.participantCounts[e.id] !== undefined) {
            this.participantCounts[e.id]++;
          }
          alert('Inscription confirmée avec succès !');
        }
        this.registeringId = null;
      },
      error: (err: any) => {
        alert(err.error?.message || "Erreur lors de l'inscription");
        this.registeringId = null;
      }
    });
  }
}

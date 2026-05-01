import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../../core/services/event.service';
import { Event } from '../../../core/models/index';

@Component({
  selector: 'app-admin-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center justify-between mb-8">
      <div><h1 class="page-title">Événements</h1><p class="page-subtitle">Gérez les événements.</p></div>
      <button (click)="openForm()" class="btn-primary btn-sm">+ Nouvel événement</button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      @for (e of events; track e.id) {
        <div class="card p-6">
          <h3 class="font-semibold mb-2">{{ e.title }}</h3>
          <p class="text-sm text-text-secondary mb-2 line-clamp-2">{{ e.description }}</p>
          @if (e.eventDate) { <p class="text-xs text-text-muted mb-3">{{ e.eventDate | date:'dd/MM/yyyy HH:mm' }}</p> }
          <div class="flex gap-2">
            <button (click)="edit(e)" class="btn-ghost btn-sm text-xs">Modifier</button>
            <button (click)="del(e.id)" class="btn-ghost btn-sm text-xs text-danger-500">Supprimer</button>
          </div>
        </div>
      }
    </div>
    @if (showForm) {
      <div class="overlay" (click)="showForm = false"></div>
      <div class="slide-over p-8">
        <h2 class="text-xl font-bold mb-6">{{ editId ? 'Modifier' : 'Nouvel' }} événement</h2>
        <form (ngSubmit)="save()" class="space-y-5">
          <div class="form-group"><label class="label">Titre</label><input class="input" [(ngModel)]="fd.title" name="t" required></div>
          <div class="form-group"><label class="label">Description</label><textarea class="input min-h-[100px]" [(ngModel)]="fd.description" name="d"></textarea></div>
          <div class="form-group"><label class="label">Lieu</label><input class="input" [(ngModel)]="fd.location" name="l"></div>
          <div class="form-group"><label class="label">Date</label><input type="datetime-local" class="input" [(ngModel)]="fd.eventDate" name="dt"></div>
          <button type="submit" class="btn-primary btn-md w-full">Enregistrer</button>
        </form>
      </div>
    }
  `
})
export class AdminEventsComponent implements OnInit {
  events: Event[] = []; showForm = false; editId: number | null = null;
  fd: any = { title: '', description: '', location: '', eventDate: '' };
  constructor(private svc: EventService) {}
  ngOnInit() { this.load(); }
  load() { this.svc.getAllEvents().subscribe(r => { if (r.success) this.events = r.data || []; }); }
  openForm() { this.editId = null; this.fd = { title: '', description: '', location: '', eventDate: '' }; this.showForm = true; }
  edit(e: Event) { this.editId = e.id; this.fd = { title: e.title, description: e.description, location: e.location, eventDate: e.eventDate }; this.showForm = true; }
  save() {
    const obs = this.editId ? this.svc.updateEvent(this.editId, this.fd) : this.svc.createEvent(this.fd);
    obs.subscribe(() => { this.showForm = false; this.load(); });
  }
  del(id: number) { if (confirm('Supprimer ?')) this.svc.deleteEvent(id).subscribe(() => this.load()); }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Event, EventRegistration } from '../models/index';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly API = `${environment.apiUrl}/api/events`;

  constructor(private http: HttpClient) {}

  getPublishedEvents(): Observable<ApiResponse<Event[]>> {
    return this.http.get<ApiResponse<Event[]>>(this.API);
  }

  getEventById(id: number): Observable<ApiResponse<Event>> {
    return this.http.get<ApiResponse<Event>>(`${this.API}/${id}`);
  }

  getAllEvents(): Observable<ApiResponse<Event[]>> {
    return this.http.get<ApiResponse<Event[]>>(`${this.API}/admin/all`);
  }

  createEvent(event: Partial<Event>, image?: File): Observable<ApiResponse<Event>> {
    const formData = new FormData();
    formData.append('event', new Blob([JSON.stringify(event)], { type: 'application/json' }));
    if (image) formData.append('image', image);
    return this.http.post<ApiResponse<Event>>(this.API, formData);
  }

  updateEvent(id: number, event: Partial<Event>, image?: File): Observable<ApiResponse<Event>> {
    const formData = new FormData();
    formData.append('event', new Blob([JSON.stringify(event)], { type: 'application/json' }));
    if (image) formData.append('image', image);
    return this.http.put<ApiResponse<Event>>(`${this.API}/${id}`, formData);
  }

  deleteEvent(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API}/${id}`);
  }

  // Registrations
  registerForEvent(eventId: number): Observable<ApiResponse<EventRegistration>> {
    return this.http.post<ApiResponse<EventRegistration>>(`${this.API}/${eventId}/registrations`, {});
  }

  getEventParticipants(eventId: number): Observable<ApiResponse<EventRegistration[]>> {
    return this.http.get<ApiResponse<EventRegistration[]>>(`${this.API}/${eventId}/registrations`);
  }

  checkRegistrationStatus(eventId: number): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.API}/${eventId}/registrations/status`);
  }

  getEventParticipantCount(eventId: number): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.API}/${eventId}/registrations/count`);
  }
}

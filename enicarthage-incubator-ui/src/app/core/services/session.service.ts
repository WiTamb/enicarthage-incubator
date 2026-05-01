import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Session } from '../models/session.model';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly API = `${environment.apiUrl}/api/sessions`;
  constructor(private http: HttpClient) {}

  getSessions(): Observable<ApiResponse<Session[]>> {
    return this.http.get<ApiResponse<Session[]>>(this.API);
  }
  getSessionById(id: number): Observable<ApiResponse<Session>> {
    return this.http.get<ApiResponse<Session>>(`${this.API}/${id}`);
  }
  createSession(data: Partial<Session>): Observable<ApiResponse<Session>> {
    return this.http.post<ApiResponse<Session>>(this.API, data);
  }
  updateSession(id: number, data: Partial<Session>): Observable<ApiResponse<Session>> {
    return this.http.put<ApiResponse<Session>>(`${this.API}/${id}`, data);
  }
  deleteSession(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API}/${id}`);
  }
}

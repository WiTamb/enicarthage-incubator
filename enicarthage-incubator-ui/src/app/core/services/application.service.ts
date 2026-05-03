import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Application, RoundResult, SelectionOverrideRequest } from '../models/session.model';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly API = environment.apiUrl;
  constructor(private http: HttpClient) {}

  applyToSession(sessionId: number): Observable<ApiResponse<Application>> {
    return this.http.post<ApiResponse<Application>>(`${this.API}/api/sessions/${sessionId}/apply`, {});
  }
  getMyApplications(): Observable<ApiResponse<Application[]>> {
    return this.http.get<ApiResponse<Application[]>>(`${this.API}/api/applications/my`);
  }
  getSessionApplications(sessionId: number, roundId?: number): Observable<ApiResponse<Application[]>> {
    let params = new HttpParams();
    if (roundId) params = params.set('roundId', roundId.toString());
    return this.http.get<ApiResponse<Application[]>>(`${this.API}/api/sessions/${sessionId}/applications`, { params });
  }
  acceptApplication(id: number): Observable<ApiResponse<Application>> {
    return this.http.put<ApiResponse<Application>>(`${this.API}/api/applications/${id}/accept`, {});
  }
  rejectApplication(id: number): Observable<ApiResponse<Application>> {
    return this.http.put<ApiResponse<Application>>(`${this.API}/api/applications/${id}/reject`, {});
  }
  advanceApplication(id: number): Observable<ApiResponse<Application>> {
    return this.http.put<ApiResponse<Application>>(`${this.API}/api/applications/${id}/advance`, {});
  }
  eliminateApplication(id: number): Observable<ApiResponse<Application>> {
    return this.http.put<ApiResponse<Application>>(`${this.API}/api/applications/${id}/eliminate`, {});
  }
  evaluateApplication(id: number, data: { score: number; comment: string; recommendation: string }): Observable<ApiResponse<Application>> {
    return this.http.put<ApiResponse<Application>>(`${this.API}/api/applications/${id}/evaluate`, data);
  }

  // ─── Selection lifecycle ───────────────────────────────────────────────

  getSelectionList(roundId: number): Observable<ApiResponse<RoundResult>> {
    return this.http.get<ApiResponse<RoundResult>>(`${this.API}/api/rounds/${roundId}/selection`);
  }

  overrideSelection(roundId: number, request: SelectionOverrideRequest): Observable<ApiResponse<RoundResult>> {
    return this.http.put<ApiResponse<RoundResult>>(`${this.API}/api/rounds/${roundId}/selection/override`, request);
  }

  finalizeSelection(roundId: number): Observable<ApiResponse<RoundResult>> {
    return this.http.post<ApiResponse<RoundResult>>(`${this.API}/api/rounds/${roundId}/selection/finalize`, {});
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Round } from '../models/session.model';

@Injectable({ providedIn: 'root' })
export class RoundService {
  private api(sessionId: number) { return `${environment.apiUrl}/api/sessions/${sessionId}/rounds`; }
  constructor(private http: HttpClient) {}

  getRounds(sessionId: number): Observable<ApiResponse<Round[]>> {
    return this.http.get<ApiResponse<Round[]>>(this.api(sessionId));
  }
  createRound(sessionId: number, data: Partial<Round>): Observable<ApiResponse<Round>> {
    return this.http.post<ApiResponse<Round>>(this.api(sessionId), data);
  }
  updateRound(sessionId: number, roundId: number, data: Partial<Round>): Observable<ApiResponse<Round>> {
    return this.http.put<ApiResponse<Round>>(`${this.api(sessionId)}/${roundId}`, data);
  }
  deleteRound(sessionId: number, roundId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api(sessionId)}/${roundId}`);
  }
}

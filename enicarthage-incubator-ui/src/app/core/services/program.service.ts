import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Program, Round } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProgramService {
  private readonly API = `${environment.apiUrl}/api/programs`;

  constructor(private http: HttpClient) {}

  getActivePrograms(): Observable<ApiResponse<Program[]>> {
    return this.http.get<ApiResponse<Program[]>>(`${this.API}/public`);
  }

  getRoundsByProgram(programId: number): Observable<ApiResponse<Round[]>> {
    return this.http.get<ApiResponse<Round[]>>(`${this.API}/public/${programId}/rounds`);
  }

  // Admin
  getAllPrograms(): Observable<ApiResponse<Program[]>> {
    return this.http.get<ApiResponse<Program[]>>(this.API);
  }

  createProgram(program: Partial<Program>): Observable<ApiResponse<Program>> {
    return this.http.post<ApiResponse<Program>>(this.API, program);
  }

  updateProgram(id: number, program: Partial<Program>): Observable<ApiResponse<Program>> {
    return this.http.put<ApiResponse<Program>>(`${this.API}/${id}`, program);
  }

  deleteProgram(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API}/${id}`);
  }

  createRound(programId: number, round: Partial<Round>): Observable<ApiResponse<Round>> {
    return this.http.post<ApiResponse<Round>>(`${this.API}/${programId}/rounds`, round);
  }

  updateRound(roundId: number, round: Partial<Round>): Observable<ApiResponse<Round>> {
    return this.http.put<ApiResponse<Round>>(`${this.API}/rounds/${roundId}`, round);
  }

  deleteRound(roundId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API}/rounds/${roundId}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Evaluation, EvaluationRequest } from '../models/index';

@Injectable({ providedIn: 'root' })
export class EvaluationService {
  private readonly API = `${environment.apiUrl}/api/evaluations`;

  constructor(private http: HttpClient) {}

  evaluate(request: EvaluationRequest): Observable<ApiResponse<Evaluation>> {
    return this.http.post<ApiResponse<Evaluation>>(this.API, request);
  }

  getByProject(projectId: number): Observable<ApiResponse<Evaluation[]>> {
    return this.http.get<ApiResponse<Evaluation[]>>(`${this.API}/project/${projectId}`);
  }

  getAverageScore(projectId: number): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.API}/project/${projectId}/average`);
  }
}

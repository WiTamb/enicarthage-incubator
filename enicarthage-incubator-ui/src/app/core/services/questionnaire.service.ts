import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { SessionQuestion, QuestionnaireAnswer } from '../models/session.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class QuestionnaireService {
  private base = `${environment.apiUrl}/api/rounds`;

  constructor(private http: HttpClient) {}

  getQuestionnaire(roundId: number): Observable<ApiResponse<SessionQuestion[]>> {
    return this.http.get<ApiResponse<SessionQuestion[]>>(`${this.base}/${roundId}/questionnaire`);
  }

  saveQuestionnaire(roundId: number, questions: Partial<SessionQuestion>[]): Observable<ApiResponse<SessionQuestion[]>> {
    return this.http.put<ApiResponse<SessionQuestion[]>>(`${this.base}/${roundId}/questionnaire`, questions);
  }

  submitAnswers(roundId: number, answers: Record<number, string>): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.base}/${roundId}/questionnaire/submit`, { answers });
  }

  hasAnswered(roundId: number): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.base}/${roundId}/questionnaire/has-answered`);
  }

  getAnswers(roundId: number, applicationId: number): Observable<ApiResponse<QuestionnaireAnswer[]>> {
    return this.http.get<ApiResponse<QuestionnaireAnswer[]>>(`${this.base}/${roundId}/questionnaire/applications/${applicationId}/answers`);
  }
}

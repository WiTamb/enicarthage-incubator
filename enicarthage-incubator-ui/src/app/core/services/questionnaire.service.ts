import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { SessionQuestion, QuestionnaireAnswer } from '../models/session.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class QuestionnaireService {
  private base = `${environment.apiUrl}/api/sessions`;

  constructor(private http: HttpClient) {}

  getQuestionnaire(sessionId: number): Observable<ApiResponse<SessionQuestion[]>> {
    return this.http.get<ApiResponse<SessionQuestion[]>>(`${this.base}/${sessionId}/questionnaire`);
  }

  saveQuestionnaire(sessionId: number, questions: Partial<SessionQuestion>[]): Observable<ApiResponse<SessionQuestion[]>> {
    return this.http.put<ApiResponse<SessionQuestion[]>>(`${this.base}/${sessionId}/questionnaire`, questions);
  }

  submitAnswers(sessionId: number, answers: Record<number, string>): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.base}/${sessionId}/questionnaire/submit`, { answers });
  }

  hasAnswered(sessionId: number): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.base}/${sessionId}/questionnaire/has-answered`);
  }

  getAnswers(sessionId: number, applicationId: number): Observable<ApiResponse<QuestionnaireAnswer[]>> {
    return this.http.get<ApiResponse<QuestionnaireAnswer[]>>(`${this.base}/${sessionId}/questionnaire/applications/${applicationId}/answers`);
  }
}

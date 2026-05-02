import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Project, ProjectRequest, ProjectStatus } from '../models/project.model';
import { QuestionnaireAnswer } from '../models/session.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly API = `${environment.apiUrl}/api/projects`;

  constructor(private http: HttpClient) {}

  getMyProjects(): Observable<ApiResponse<Project[]>> {
    return this.http.get<ApiResponse<Project[]>>(`${this.API}/my`);
  }

  getProjectById(id: number): Observable<ApiResponse<Project>> {
    return this.http.get<ApiResponse<Project>>(`${this.API}/${id}`);
  }

  getAllProjects(status?: ProjectStatus): Observable<ApiResponse<Project[]>> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<Project[]>>(this.API, { params });
  }

  submitProject(request: ProjectRequest, document?: File, image?: File): Observable<ApiResponse<Project>> {
    const formData = new FormData();
    formData.append('project', JSON.stringify(request));
    if (document) formData.append('document', document);
    if (image) formData.append('image', image);
    return this.http.post<ApiResponse<Project>>(this.API, formData);
  }

  updateStatus(id: number, status: ProjectStatus): Observable<ApiResponse<Project>> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<ApiResponse<Project>>(`${this.API}/${id}/status`, {}, { params });
  }

  deleteProject(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API}/${id}`);
  }

  getProjectAnswers(id: number): Observable<ApiResponse<QuestionnaireAnswer[]>> {
    return this.http.get<ApiResponse<QuestionnaireAnswer[]>>(`${this.API}/${id}/questionnaire-answers`);
  }
}

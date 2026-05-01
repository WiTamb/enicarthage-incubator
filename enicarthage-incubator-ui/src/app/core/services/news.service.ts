import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { News } from '../models/index';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly API = `${environment.apiUrl}/api/news`;

  constructor(private http: HttpClient) {}

  getPublishedNews(): Observable<ApiResponse<News[]>> {
    return this.http.get<ApiResponse<News[]>>(this.API);
  }

  getNewsById(id: number): Observable<ApiResponse<News>> {
    return this.http.get<ApiResponse<News>>(`${this.API}/${id}`);
  }

  getAllNews(): Observable<ApiResponse<News[]>> {
    return this.http.get<ApiResponse<News[]>>(`${this.API}/admin/all`);
  }

  createNews(news: Partial<News>, image?: File): Observable<ApiResponse<News>> {
    const formData = new FormData();
    formData.append('news', new Blob([JSON.stringify(news)], { type: 'application/json' }));
    if (image) formData.append('image', image);
    return this.http.post<ApiResponse<News>>(this.API, formData);
  }

  updateNews(id: number, news: Partial<News>, image?: File): Observable<ApiResponse<News>> {
    const formData = new FormData();
    formData.append('news', new Blob([JSON.stringify(news)], { type: 'application/json' }));
    if (image) formData.append('image', image);
    return this.http.put<ApiResponse<News>>(`${this.API}/${id}`, formData);
  }

  deleteNews(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API}/${id}`);
  }
}

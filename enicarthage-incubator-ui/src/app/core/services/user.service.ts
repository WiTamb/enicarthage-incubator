import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { User, Role } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.API}/api/profile`);
  }

  updateProfile(data: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.API}/api/profile`, data);
  }

  completeProfile(data: any): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.API}/api/users/complete-profile`, data);
  }

  getEvaluators(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.API}/api/evaluators`);
  }

  // Admin
  getAllUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.API}/api/admin/users`);
  }

  getUserById(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.API}/api/admin/users/${id}`);
  }

  toggleBlock(id: number): Observable<ApiResponse<User>> {
    return this.http.patch<ApiResponse<User>>(`${this.API}/api/admin/users/${id}/toggle-block`, {});
  }

  changeRole(id: number, role: Role): Observable<ApiResponse<User>> {
    const params = new HttpParams().set('role', role);
    return this.http.patch<ApiResponse<User>>(`${this.API}/api/admin/users/${id}/role`, {}, { params });
  }

  deleteUser(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API}/api/admin/users/${id}`);
  }

  inviteEvaluator(email: string): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.API}/api/admin/evaluators/invite`, { email });
  }
}

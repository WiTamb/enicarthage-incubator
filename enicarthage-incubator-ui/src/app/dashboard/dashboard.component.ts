import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: any = null;
  projects: any[] = [];
  events: any[] = [];

  constructor(
    private authService: AuthService, 
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.user = JSON.parse(userStr);
    }
    
    this.fetchData();
  }

  fetchData() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Fetch Projects based on role
    const isStudent = this.user?.role === 'STUDENT';
    const projectsEndpoint = isStudent 
      ? 'http://localhost:8085/api/projects/my' 
      : 'http://localhost:8085/api/projects';

    this.http.get(projectsEndpoint, { headers }).subscribe({
      next: (res: any) => {
        if (res.data) {
          this.projects = res.data;
        }
      },
      error: (err) => console.error('Error fetching projects:', err)
    });

    // Fetch Events
    this.http.get('http://localhost:8085/api/events', { headers }).subscribe({
      next: (res: any) => {
        if (res.data) {
          this.events = res.data;
        }
      },
      error: (err) => console.error('Error fetching events:', err)
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

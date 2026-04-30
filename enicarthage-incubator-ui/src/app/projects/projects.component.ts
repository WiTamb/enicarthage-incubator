import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'] // reuse dashboard list css
})
export class ProjectsComponent implements OnInit {
  projects: any[] = [];
  user: any = null;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      const userStr = localStorage.getItem('user');
      if (userStr) this.user = JSON.parse(userStr);
      this.fetchProjects();
    }
  }

  fetchProjects() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    const isStudent = this.user?.role === 'STUDENT';
    const projectsEndpoint = isStudent 
      ? 'http://localhost:8085/api/projects/my' 
      : 'http://localhost:8085/api/projects';

    this.http.get(projectsEndpoint, { headers }).subscribe({
      next: (res: any) => {
        if (res.data) this.projects = res.data;
      },
      error: (err) => console.error('Error fetching projects:', err)
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-submit-project',
  templateUrl: './submit-project.component.html',
  styleUrls: ['./submit-project.component.css']
})
export class SubmitProjectComponent implements OnInit {
  project = {
    title: '',
    description: '',
    programId: null
  };
  
  programs: any[] = [];
  selectedFile: File | null = null;
  selectedImage: File | null = null;
  isSubmitting = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.fetchPrograms();
  }

  fetchPrograms() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    this.http.get('http://localhost:8085/api/programs/public', { headers }).subscribe({
      next: (res: any) => {
        if (res.data) {
          this.programs = res.data;
          if (this.programs.length > 0) {
            this.project.programId = this.programs[0].id;
          }
        }
      },
      error: (err) => console.error('Error fetching programs:', err)
    });
  }

  onFileChange(event: any, type: 'document' | 'image') {
    const file = event.target.files[0];
    if (type === 'document') {
      this.selectedFile = file;
    } else {
      this.selectedImage = file;
    }
  }

  onSubmit() {
    this.isSubmitting = true;
    const token = localStorage.getItem('token');
    
    // Create FormData for multipart/form-data
    const formData = new FormData();
    formData.append('project', JSON.stringify(this.project));
    
    if (this.selectedFile) formData.append('document', this.selectedFile);
    if (this.selectedImage) formData.append('image', this.selectedImage);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // Note: Do NOT set Content-Type here; browser will automatically set it with the correct boundary for FormData
    });

    this.http.post('http://localhost:8085/api/projects', formData, { headers }).subscribe({
      next: (res) => {
        alert('Projet soumis avec succès !');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        const errorMsg = err.error?.message || err.message || 'Erreur inconnue';
        alert('Erreur lors de la soumission du projet: ' + errorMsg);
        console.error(err);
        this.isSubmitting = false;
      }
    });
  }
}

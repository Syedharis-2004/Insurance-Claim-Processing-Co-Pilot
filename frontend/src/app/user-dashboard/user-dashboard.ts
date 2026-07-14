import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../api-config';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css',
})
export class UserDashboard implements OnInit, OnDestroy {
  claimantName = 'Ava Thompson';
  policyNumber = 'POL-2048';
  damageType = 'Rear bumper';
  damageDescription = 'Passenger-side rear impact with panel distortion and scratch segment.';
  isLoading = false;

  selectedImage: File | null = null;
  selectedDoc: File | null = null;
  
  myClaims: any[] = [];
  private pollIntervalId: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchMyClaims();
    // Poll every 4 seconds to catch real-time status updates (like Admin Approval)
    this.pollIntervalId = setInterval(() => {
      this.fetchMyClaims();
    }, 4000);
  }

  ngOnDestroy(): void {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
    }
  }

  fetchMyClaims(): void {
    this.http.get<any[]>(`${API_BASE_URL}/api/claims`).subscribe({
      next: (claims) => {
        // In a real app, we would filter by claimant name/policy.
        // For the demo, we show the claims in the system.
        this.myClaims = claims.map(c => ({
          id: c.id,
          type: c.damage_type ? c.damage_type.split(' ')[0] : 'General',
          status: c.status,
          statusColor: c.status === 'Approved' ? 'emerald' : c.status === 'Pending Review' ? 'amber' : c.status === 'Rejected' ? 'rose' : 'violet',
          amount: c.estimated_cost_range || 'Pending Analysis'
        }));
      },
      error: (err) => console.error('Error fetching user claims:', err)
    });
  }

  onImageSelected(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedImage = event.target.files[0];
    }
  }

  onDocSelected(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedDoc = event.target.files[0];
    }
  }

  submitClaim(): void {
    this.isLoading = true;
    const formData = new FormData();
    formData.append('claimant_name', this.claimantName);
    formData.append('policy_number', this.policyNumber);
    formData.append('damage_type', this.damageType);
    if (this.selectedImage) formData.append('image', this.selectedImage);
    if (this.selectedDoc) formData.append('pdf_document', this.selectedDoc);

    this.http.post<any>(`${API_BASE_URL}/api/claims/submit`, formData).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.fetchMyClaims();
        
        // Trigger analysis in the background for Admin
        this.http.post<any>(`${API_BASE_URL}/api/claims/analyze`, {}).subscribe({
          next: () => this.fetchMyClaims()
        });
      },
      error: (err) => { console.error(err); this.isLoading = false; }
    });
  }
}

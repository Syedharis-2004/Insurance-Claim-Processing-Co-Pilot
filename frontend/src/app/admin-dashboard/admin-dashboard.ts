import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../api-config';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  activeClaimId = '';
  reviewState = '';
  isLoading = false;

  stats = [
    { label: 'Total Claims', value: '1,284', icon: '📋', color: 'blue', trend: 1, trendLabel: '12% this month' },
    { label: 'Pending Reviews', value: '186', icon: '⏳', color: 'amber', trend: -1, trendLabel: '5% vs last wk' },
    { label: 'Approved Claims', value: '842', icon: '✅', color: 'emerald', trend: 1, trendLabel: '8% this month' },
    { label: 'AI Accuracy', value: '94%', icon: '🤖', color: 'violet', trend: 1, trendLabel: '+2% vs baseline' },
  ];

  aiResult = {
    classification: 'Vehicle Damage',
    severity: 'Moderate',
    confidence: 93,
    estimatedCost: '$1,800 – $3,200',
    fraudRisk: 11,
    explanation:
      'Damaged region heatmap highlights rear passenger side with peak activation around panel impact and surface cracking. Low fraud signal detected.',
  };

  roiMetrics = [
    { icon: '⚡', label: 'Avg. claim cycle time reduction', value: '38% faster' },
    { icon: '💰', label: 'Estimated annual savings', value: '$2.4M' },
    { icon: '🛡️', label: 'Fraud detection improvement', value: '64% better' },
    { icon: '📈', label: 'Coverage scope', value: 'Auto, Home, Multi-line' },
  ];

  recentClaims: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchClaims();
  }

  get severityClass(): string {
    const map: Record<string, string> = {
      Low: 'badge-emerald',
      Moderate: 'badge-amber',
      High: 'badge-rose',
      Critical: 'badge-rose',
    };
    return map[this.aiResult.severity] ?? 'badge-blue';
  }

  get fraudRiskClass(): string {
    if (this.aiResult.fraudRisk <= 20) return 'cw-progress-emerald';
    if (this.aiResult.fraudRisk <= 50) return 'cw-progress-amber';
    return 'cw-progress-rose';
  }

  get fraudRiskTextClass(): string {
    if (this.aiResult.fraudRisk <= 20) return 'label-emerald';
    if (this.aiResult.fraudRisk <= 50) return 'label-amber';
    return 'label-rose';
  }

  get reviewBadgeClass(): string {
    if (this.reviewState === 'Approved') return 'review-approved';
    if (this.reviewState === 'Rejected') return 'review-rejected';
    if (this.reviewState === 'Needs Correction' || this.reviewState === 'needs correction') return 'review-modify';
    return 'review-pending';
  }

  fetchClaims(): void {
    this.http.get<any[]>(`${API_BASE_URL}/api/claims`).subscribe({
      next: (claims) => {
        this.recentClaims = claims.map(c => ({
          id: c.id,
          claimant: c.claimant_name,
          type: c.damage_type ? c.damage_type.split(' ')[0] : 'General',
          status: c.status,
          statusColor: c.status === 'Approved' ? 'emerald' : c.status === 'Pending Review' ? 'amber' : c.status === 'Rejected' ? 'rose' : 'violet',
          amount: c.estimated_cost_range || '$0',
          rawClaim: c
        }));
        
        // Update total stats values dynamically if needed
        this.stats[0].value = claims.length.toString();
        this.stats[1].value = claims.filter(c => c.status === 'Pending Review').length.toString();
        this.stats[2].value = claims.filter(c => c.status === 'Approved').length.toString();
      },
      error: (err) => console.error(err)
    });
  }

  selectClaim(claim: any): void {
    this.activeClaimId = claim.id;
    this.reviewState = claim.status;
    const rc = claim.rawClaim;
    if (rc && rc.classification) {
      this.aiResult = {
        classification: rc.classification,
        severity: rc.severity,
        confidence: Math.round(rc.confidence_score * 100) || 90,
        estimatedCost: rc.estimated_cost_range || '$1,500 - $3,000',
        fraudRisk: Math.round(rc.fraud_risk_score * 100) || 10,
        explanation: rc.explanation || 'No AI explanation generated yet.',
      };
    } else {
      // Fallback or request analysis
      this.aiResult = {
        classification: 'Pending Analysis',
        severity: 'Low',
        confidence: 0,
        estimatedCost: '$0',
        fraudRisk: 0,
        explanation: 'AI has not completed analysis on this claim.'
      };
    }
  }

  submitReview(action: 'approve' | 'reject' | 'modify'): void {
    let decision = '';
    if (action === 'approve') decision = 'approved';
    else if (action === 'reject') decision = 'rejected';
    else decision = 'needs correction';

    this.http.patch<any>(`${API_BASE_URL}/api/claims/${this.activeClaimId}/review?decision=${decision}`, {}).subscribe({
      next: (res) => {
        this.reviewState = res.decision.charAt(0).toUpperCase() + res.decision.slice(1);
        this.fetchClaims();
      },
      error: (err) => console.error(err)
    });
  }

  generatePdfReport(): void {
    const url = `${API_BASE_URL}/api/reports/${this.activeClaimId}/pdf`;
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = `claimwise_${this.activeClaimId}.pdf`;
        link.click();
        URL.revokeObjectURL(objectUrl);
      },
      error: (err) => {
        console.error('PDF download failed:', err);
        alert('PDF download failed. Please ensure the backend is running.');
      }
    });
  }
}

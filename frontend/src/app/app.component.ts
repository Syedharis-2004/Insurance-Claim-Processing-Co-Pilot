import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cw-shell" [class.loading]="isLoading">

      <!-- ── NAVBAR ── -->
      <nav class="cw-nav">
        <div class="cw-nav-inner">
          <div class="cw-brand">
            <span class="cw-brand-icon">⚡</span>
            <span class="cw-brand-name">ClaimWise <span class="gradient-text">AI</span></span>
            <span class="cw-brand-badge">v2.0</span>
          </div>
          <div class="cw-nav-center">
            <a class="cw-nav-link" [class.active]="currentView === 'dashboard'" (click)="currentView = 'dashboard'; $event.preventDefault()" href="#">Dashboard</a>
            <a class="cw-nav-link" [class.active]="currentView === 'architecture'" (click)="currentView = 'architecture'; $event.preventDefault()" href="#">Architecture</a>
            <a class="cw-nav-link" href="#">Claims</a>
            <a class="cw-nav-link" href="#">Analytics</a>
          </div>
          <div class="cw-nav-actions">
            <div class="cw-status-pill">
              <span class="cw-status-dot"></span>
              AI Online
            </div>
            <button class="btn-ghost">Login</button>
            <button class="btn-primary-pill">Get Started</button>
          </div>
        </div>
      </nav>

      <!-- ── MAIN CONTENT ── -->
      <main class="cw-main">

        <ng-container *ngIf="currentView === 'dashboard'">

        <!-- PAGE HEADER -->
        <div class="cw-page-header">
          <div>
            <p class="cw-page-sub">Insurance Claims Management</p>
            <h1 class="cw-page-title">AI-Powered <span class="gradient-text">Claims Dashboard</span></h1>
          </div>
          <div class="cw-header-meta">
            <span class="cw-timestamp">Last updated: just now</span>
            <button class="btn-icon" title="Refresh">↻</button>
          </div>
        </div>

        <!-- STATS ROW -->
        <div class="cw-stats-grid">
          <div class="cw-stat-card" *ngFor="let stat of stats; let i = index" [style.--card-delay]="(i * 80) + 'ms'">
            <div class="cw-stat-icon" [class]="'icon-' + stat.color">{{ stat.icon }}</div>
            <div class="cw-stat-info">
              <span class="cw-stat-label">{{ stat.label }}</span>
              <span class="cw-stat-value">{{ stat.value }}</span>
            </div>
            <div class="cw-stat-trend" [class.trend-up]="stat.trend > 0" [class.trend-down]="stat.trend < 0">
              {{ stat.trend > 0 ? '▲' : '▼' }} {{ stat.trendLabel }}
            </div>
          </div>
        </div>

        <!-- MAIN GRID -->
        <div class="cw-content-grid">

          <!-- LEFT: CLAIM INTAKE -->
          <div class="cw-panel" id="claim-intake-panel">
            <div class="cw-panel-header">
              <div>
                <h2 class="cw-panel-title">New Claim Intake</h2>
                <p class="cw-panel-sub">Multimodal AI-assisted submission</p>
              </div>
              <span class="cw-badge badge-blue">Multimodal</span>
            </div>

            <form class="cw-form" (ngSubmit)="submitClaim()">
              <div class="cw-form-row">
                <div class="cw-field">
                  <label class="cw-label">Claimant Name</label>
                  <div class="cw-input-wrap">
                    <span class="cw-input-icon">👤</span>
                    <input class="cw-input" [(ngModel)]="claimantName" name="claimantName" placeholder="Full legal name" />
                  </div>
                </div>
                <div class="cw-field">
                  <label class="cw-label">Policy Number</label>
                  <div class="cw-input-wrap">
                    <span class="cw-input-icon">🔖</span>
                    <input class="cw-input" [(ngModel)]="policyNumber" name="policyNumber" placeholder="POL-XXXX" />
                  </div>
                </div>
              </div>

              <div class="cw-field">
                <label class="cw-label">Damage Category</label>
                <div class="cw-input-wrap">
                  <span class="cw-input-icon">🏷️</span>
                  <input class="cw-input" [(ngModel)]="damageType" name="damageType" placeholder="e.g. Rear bumper, Roof damage" />
                </div>
              </div>

              <div class="cw-field">
                <label class="cw-label">Damage Description</label>
                <textarea class="cw-input cw-textarea" rows="3" [(ngModel)]="damageDescription" name="damageDescription" placeholder="Describe the damage in detail…"></textarea>
              </div>

              <div class="cw-upload-row">
                <label class="cw-upload-box" for="imageUpload">
                  <span class="cw-upload-icon">🖼️</span>
                  <span class="cw-upload-label">Upload Image</span>
                  <span class="cw-upload-hint">PNG, JPG up to 10MB</span>
                  <input type="file" id="imageUpload" class="cw-file-hidden" accept="image/*" aria-label="Damage image upload" (change)="onImageSelected($event)" />
                </label>
                <label class="cw-upload-box" for="docUpload">
                  <span class="cw-upload-icon">📄</span>
                  <span class="cw-upload-label">Upload Document</span>
                  <span class="cw-upload-hint">PDF, DOC up to 25MB</span>
                  <input type="file" id="docUpload" class="cw-file-hidden" accept=".pdf,.doc,.docx" aria-label="Supporting document upload" (change)="onDocSelected($event)" />
                </label>
              </div>

              <div class="cw-form-actions">
                <button class="btn-primary-pill btn-wide" type="submit" [class.btn-loading]="isLoading">
                  <span *ngIf="!isLoading">⚡ Submit Claim</span>
                  <span *ngIf="isLoading" class="cw-spinner-wrap"><span class="cw-spinner"></span> Processing…</span>
                </button>
                <button class="btn-glass" type="button" (click)="submitReview('approve')">✓ Approve Demo</button>
                <button class="btn-ghost-danger" type="button" (click)="submitReview('reject')">✗ Reject Demo</button>
              </div>
            </form>
          </div>

          <!-- RIGHT: AI ANALYSIS -->
          <div class="cw-panel cw-ai-panel" id="ai-analysis-panel">
            <div class="cw-panel-header">
              <div>
                <h2 class="cw-panel-title">AI Analysis</h2>
                <p class="cw-panel-sub">Real-time risk assessment</p>
              </div>
              <span class="cw-badge badge-violet">Live</span>
            </div>

            <div class="cw-claim-id">
              <span class="cw-label">Active Claim</span>
              <span class="cw-claim-id-value">{{ activeClaimId }}</span>
            </div>

            <div class="cw-ai-metrics">
              <div class="cw-metric-row">
                <span class="cw-metric-label">Classification</span>
                <span class="cw-metric-value">{{ aiResult.classification }}</span>
              </div>
              <div class="cw-metric-row">
                <span class="cw-metric-label">Severity</span>
                <span class="cw-badge" [ngClass]="severityClass">{{ aiResult.severity }}</span>
              </div>
              <div class="cw-metric-row">
                <span class="cw-metric-label">Confidence</span>
                <div class="cw-progress-wrap">
                  <div class="cw-progress-bar">
                    <div class="cw-progress-fill cw-progress-blue" [style.width]="aiResult.confidence + '%'"></div>
                  </div>
                  <span class="cw-progress-label">{{ aiResult.confidence }}%</span>
                </div>
              </div>
              <div class="cw-metric-row">
                <span class="cw-metric-label">Estimated Cost</span>
                <span class="cw-metric-value accent-emerald">{{ aiResult.estimatedCost }}</span>
              </div>
              <div class="cw-metric-row">
                <span class="cw-metric-label">Fraud Risk</span>
                <div class="cw-progress-wrap">
                  <div class="cw-progress-bar">
                    <div class="cw-progress-fill" [ngClass]="fraudRiskClass" [style.width]="aiResult.fraudRisk + '%'"></div>
                  </div>
                  <span class="cw-progress-label" [ngClass]="fraudRiskTextClass">{{ aiResult.fraudRisk }}%</span>
                </div>
              </div>
            </div>

            <div class="cw-explanation">
              <span class="cw-expl-label">🔍 AI Explanation</span>
              <p class="cw-expl-text">{{ aiResult.explanation }}</p>
            </div>

            <div class="cw-heatmap-section" style="margin-top: 1rem;">
              <span class="cw-expl-label">🌡️ Grad-CAM Heatmap</span>
              <div class="cw-heatmap-img" style="height: 120px; background: linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(245,158,11,0.2) 50%, rgba(16,185,129,0.2) 100%); border-radius: 8px; border: 1px dashed rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 0.8rem; margin-bottom: 0.5rem;">
                [Heatmap Visualization]
              </div>
            </div>

            <div class="cw-feature-importance" style="margin-top: 1rem;">
              <span class="cw-expl-label">📊 Feature Importance</span>
              <div class="cw-metric-row" style="margin-bottom: 0.4rem;">
                <span class="cw-metric-label" style="font-size: 0.7rem;">Panel Distortion</span>
                <div class="cw-progress-wrap"><div class="cw-progress-bar" style="height: 4px;"><div class="cw-progress-fill cw-progress-rose" style="width: 85%"></div></div></div>
              </div>
              <div class="cw-metric-row" style="margin-bottom: 0.4rem;">
                <span class="cw-metric-label" style="font-size: 0.7rem;">Paint Scratches</span>
                <div class="cw-progress-wrap"><div class="cw-progress-bar" style="height: 4px;"><div class="cw-progress-fill cw-progress-amber" style="width: 45%"></div></div></div>
              </div>
              <div class="cw-metric-row" style="margin-bottom: 0.4rem;">
                <span class="cw-metric-label" style="font-size: 0.7rem;">Structural Integrity</span>
                <div class="cw-progress-wrap"><div class="cw-progress-bar" style="height: 4px;"><div class="cw-progress-fill cw-progress-emerald" style="width: 15%"></div></div></div>
              </div>
            </div>
          </div>
        </div>

        <!-- BOTTOM GRID -->
        <div class="cw-bottom-grid">

          <!-- REVIEW WORKFLOW -->
          <div class="cw-panel" id="review-workflow-panel">
            <div class="cw-panel-header">
              <div>
                <h2 class="cw-panel-title">Review Workflow</h2>
                <p class="cw-panel-sub">Human-in-the-loop decisions</p>
              </div>
            </div>
            <div class="cw-review-state">
              <span class="cw-review-state-label">Current State</span>
              <span class="cw-review-badge" [ngClass]="reviewBadgeClass">{{ reviewState }}</span>
            </div>
            <div class="cw-review-actions">
              <button class="btn-action btn-approve" (click)="submitReview('approve')">
                <span>✓</span> Approve
              </button>
              <button class="btn-action btn-reject" (click)="submitReview('reject')">
                <span>✗</span> Reject
              </button>
              <button class="btn-action btn-modify" (click)="submitReview('modify')">
                <span>✎</span> Modify
              </button>
            </div>
            <button class="btn-action btn-pdf" (click)="generatePdfReport()" style="margin-top: 0.5rem; width: 100%; background: rgba(79, 142, 247, 0.12); color: var(--accent-blue); border-color: rgba(79, 142, 247, 0.25);">
              <span>📄</span> Download PDF Report
            </button>
          </div>

          <!-- ROI CALCULATOR -->
          <div class="cw-panel cw-roi-panel" id="roi-panel">
            <div class="cw-panel-header">
              <div>
                <h2 class="cw-panel-title">ROI Calculator</h2>
                <p class="cw-panel-sub">Performance impact metrics</p>
              </div>
              <span class="cw-badge badge-emerald">Live</span>
            </div>
            <div class="cw-roi-metrics">
              <div class="cw-roi-item" *ngFor="let roi of roiMetrics">
                <div class="cw-roi-icon">{{ roi.icon }}</div>
                <div class="cw-roi-info">
                  <span class="cw-roi-label">{{ roi.label }}</span>
                  <span class="cw-roi-value">{{ roi.value }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- RECENT CLAIMS -->
          <div class="cw-panel cw-claims-table-panel" id="recent-claims-panel">
            <div class="cw-panel-header">
              <div>
                <h2 class="cw-panel-title">Recent Claims</h2>
                <p class="cw-panel-sub">Last 5 processed claims</p>
              </div>
            </div>
            <div class="cw-table-wrap">
              <table class="cw-table">
                <thead>
                  <tr>
                    <th>Claim ID</th>
                    <th>Claimant</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let c of recentClaims">
                    <td class="cw-table-id">{{ c.id }}</td>
                    <td>{{ c.claimant }}</td>
                    <td>{{ c.type }}</td>
                    <td><span class="cw-badge" [ngClass]="'badge-' + c.statusColor">{{ c.status }}</span></td>
                    <td class="accent-emerald">{{ c.amount }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </ng-container>

        <ng-container *ngIf="currentView === 'architecture'">
          <div class="cw-page-header">
            <div>
              <p class="cw-page-sub">System Overview</p>
              <h1 class="cw-page-title">Architecture <span class="gradient-text">Diagram</span></h1>
            </div>
          </div>
          <div class="cw-panel" style="padding: 3rem; text-align: center; border: 1px dashed rgba(255,255,255,0.2);">
             <h2 style="color: var(--text-primary); margin-bottom: 1rem;">ClaimWise AI Multimodal Architecture</h2>
             <div style="display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap;">
                <div style="padding: 1.5rem; background: rgba(79,142,247,0.1); border-radius: 8px; border: 1px solid rgba(79,142,247,0.3); width: 200px;">
                  <h3 style="color: var(--accent-blue);">Frontend</h3>
                  <p style="font-size: 0.8rem; color: var(--text-secondary);">Angular 20, Bootstrap 5</p>
                </div>
                <div style="padding: 1.5rem; background: rgba(52,211,153,0.1); border-radius: 8px; border: 1px solid rgba(52,211,153,0.3); width: 200px;">
                  <h3 style="color: var(--accent-emerald);">Backend API</h3>
                  <p style="font-size: 0.8rem; color: var(--text-secondary);">FastAPI, Python, JWT</p>
                </div>
                <div style="padding: 1.5rem; background: rgba(167,139,250,0.1); border-radius: 8px; border: 1px solid rgba(167,139,250,0.3); width: 200px;">
                  <h3 style="color: var(--accent-violet);">AI Engine</h3>
                  <p style="font-size: 0.8rem; color: var(--text-secondary);">TensorFlow, CNN, SHAP, Grad-CAM</p>
                </div>
                <div style="padding: 1.5rem; background: rgba(251,191,36,0.1); border-radius: 8px; border: 1px solid rgba(251,191,36,0.3); width: 200px;">
                  <h3 style="color: var(--accent-amber);">Database</h3>
                  <p style="font-size: 0.8rem; color: var(--text-secondary);">PostgreSQL</p>
                </div>
             </div>
          </div>
        </ng-container>
      </main>
    </div>
  `,
  styles: [`
    /* ═══════════════════════════════════════
       SHELL & LAYOUT
    ═══════════════════════════════════════ */
    .cw-shell {
      position: relative;
      z-index: 1;
      min-height: 100vh;
    }

    /* ═══════════════════════════════════════
       NAVBAR
    ═══════════════════════════════════════ */
    .cw-nav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(5, 13, 26, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 0 1.5rem;
    }

    .cw-nav-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1600px;
      margin: 0 auto;
      height: 64px;
      gap: 1rem;
    }

    .cw-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .cw-brand-icon {
      font-size: 1.4rem;
      filter: drop-shadow(0 0 8px rgba(79,142,247,0.8));
    }

    .cw-brand-name {
      font-size: 1.1rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }

    .cw-brand-badge {
      font-size: 0.65rem;
      font-weight: 600;
      padding: 2px 6px;
      background: rgba(79, 142, 247, 0.2);
      border: 1px solid rgba(79, 142, 247, 0.3);
      border-radius: 999px;
      color: var(--accent-blue);
    }

    .cw-nav-center {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .cw-nav-link {
      padding: 0.4rem 0.85rem;
      border-radius: 999px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .cw-nav-link:hover,
    .cw-nav-link.active {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.08);
    }

    .cw-nav-link.active {
      background: rgba(79, 142, 247, 0.15);
      color: var(--accent-blue);
    }

    .cw-nav-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    .cw-status-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--accent-emerald);
      padding: 4px 12px;
      background: rgba(52, 211, 153, 0.1);
      border: 1px solid rgba(52, 211, 153, 0.2);
      border-radius: 999px;
    }

    .cw-status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--accent-emerald);
      box-shadow: 0 0 6px var(--accent-emerald);
      animation: pulse-dot 2s infinite;
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    /* ═══════════════════════════════════════
       MAIN CONTENT
    ═══════════════════════════════════════ */
    .cw-main {
      max-width: 1600px;
      margin: 0 auto;
      padding: 2rem 1.5rem 3rem;
    }

    /* ═══════════════════════════════════════
       PAGE HEADER
    ═══════════════════════════════════════ */
    .cw-page-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 1.75rem;
    }

    .cw-page-sub {
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent-blue);
      margin-bottom: 0.25rem;
    }

    .cw-page-title {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--text-primary);
      line-height: 1.2;
    }

    .gradient-text {
      background: linear-gradient(135deg, #4f8ef7, #a78bfa, #22d3ee);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .cw-header-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .cw-timestamp {
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    /* ═══════════════════════════════════════
       STATS GRID
    ═══════════════════════════════════════ */
    .cw-stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.25rem;
    }

    .cw-stat-card {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      backdrop-filter: blur(12px);
      transition: all var(--transition-med);
      animation: fadeSlideUp var(--transition-slow) both;
      animation-delay: var(--card-delay, 0ms);
      position: relative;
      overflow: hidden;
    }

    .cw-stat-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.04), transparent);
      pointer-events: none;
    }

    .cw-stat-card:hover {
      border-color: rgba(255, 255, 255, 0.18);
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.3), var(--shadow-glow);
    }

    .cw-stat-icon {
      font-size: 1.75rem;
      width: 52px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md);
      flex-shrink: 0;
    }

    .icon-blue { background: rgba(79,142,247,0.15); }
    .icon-amber { background: rgba(251,191,36,0.15); }
    .icon-emerald { background: rgba(52,211,153,0.15); }
    .icon-violet { background: rgba(167,139,250,0.15); }

    .cw-stat-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .cw-stat-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .cw-stat-value {
      font-size: 1.6rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      line-height: 1.2;
    }

    .cw-stat-trend {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 999px;
      align-self: flex-start;
      margin-top: 2px;
    }

    .trend-up { background: rgba(52,211,153,0.12); color: var(--accent-emerald); }
    .trend-down { background: rgba(251,113,133,0.12); color: var(--accent-rose); }

    /* ═══════════════════════════════════════
       CONTENT GRID
    ═══════════════════════════════════════ */
    .cw-content-grid {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 1.25rem;
      margin-bottom: 1.25rem;
    }

    /* ═══════════════════════════════════════
       PANEL (glass card)
    ═══════════════════════════════════════ */
    .cw-panel {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      animation: fadeSlideUp var(--transition-slow) both;
      position: relative;
      overflow: hidden;
    }

    .cw-panel::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    }

    .cw-panel-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }

    .cw-panel-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.01em;
    }

    .cw-panel-sub {
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* ═══════════════════════════════════════
       FORM
    ═══════════════════════════════════════ */
    .cw-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cw-form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .cw-field {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .cw-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .cw-input-wrap {
      position: relative;
    }

    .cw-input-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1rem;
      pointer-events: none;
    }

    .cw-input {
      width: 100%;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-sm);
      padding: 0.6rem 0.9rem 0.6rem 2.5rem;
      color: var(--text-primary);
      font-size: 0.875rem;
      font-family: inherit;
      transition: all var(--transition-fast);
      outline: none;
    }

    .cw-field:not(:has(.cw-input-icon)) .cw-input,
    .cw-textarea {
      padding-left: 0.9rem;
    }

    .cw-input:focus {
      border-color: rgba(79, 142, 247, 0.5);
      background: rgba(79, 142, 247, 0.08);
      box-shadow: 0 0 0 3px rgba(79, 142, 247, 0.12);
    }

    .cw-input::placeholder {
      color: var(--text-muted);
    }

    .cw-textarea {
      resize: vertical;
      min-height: 80px;
      width: 100%;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-sm);
      padding: 0.6rem 0.9rem;
      color: var(--text-primary);
      font-size: 0.875rem;
      font-family: inherit;
      transition: all var(--transition-fast);
      outline: none;
    }

    .cw-textarea:focus {
      border-color: rgba(79, 142, 247, 0.5);
      background: rgba(79, 142, 247, 0.08);
      box-shadow: 0 0 0 3px rgba(79, 142, 247, 0.12);
    }

    .cw-textarea::placeholder {
      color: var(--text-muted);
    }

    /* UPLOAD BOXES */
    .cw-upload-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .cw-upload-box {
      border: 2px dashed rgba(255, 255, 255, 0.12);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.3rem;
      cursor: pointer;
      transition: all var(--transition-fast);
      text-align: center;
    }

    .cw-upload-box:hover {
      border-color: rgba(79, 142, 247, 0.4);
      background: rgba(79, 142, 247, 0.06);
    }

    .cw-upload-icon { font-size: 1.5rem; }

    .cw-upload-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .cw-upload-hint {
      font-size: 0.72rem;
      color: var(--text-muted);
    }

    .cw-file-hidden {
      display: none;
    }

    /* FORM ACTIONS */
    .cw-form-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    /* ═══════════════════════════════════════
       AI PANEL
    ═══════════════════════════════════════ */
    .cw-claim-id {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background: rgba(79, 142, 247, 0.08);
      border: 1px solid rgba(79, 142, 247, 0.2);
      border-radius: var(--radius-sm);
      margin-bottom: 1.25rem;
    }

    .cw-claim-id-value {
      font-size: 1rem;
      font-weight: 700;
      color: var(--accent-blue);
      font-family: 'JetBrains Mono', 'Courier New', monospace;
    }

    .cw-ai-metrics {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      margin-bottom: 1.25rem;
    }

    .cw-metric-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .cw-metric-label {
      font-size: 0.78rem;
      font-weight: 500;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .cw-metric-value {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .accent-emerald { color: var(--accent-emerald); }

    .cw-progress-wrap {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex: 1;
    }

    .cw-progress-bar {
      flex: 1;
      height: 6px;
      background: rgba(255,255,255,0.08);
      border-radius: 999px;
      overflow: hidden;
    }

    .cw-progress-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .cw-progress-blue { background: linear-gradient(90deg, #4f8ef7, #22d3ee); }
    .cw-progress-emerald { background: linear-gradient(90deg, #34d399, #6ee7b7); }
    .cw-progress-amber { background: linear-gradient(90deg, #fbbf24, #fb923c); }
    .cw-progress-rose { background: linear-gradient(90deg, #fb7185, #f43f5e); }

    .cw-progress-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-secondary);
      min-width: 36px;
      text-align: right;
    }

    .label-emerald { color: var(--accent-emerald); }
    .label-amber { color: var(--accent-amber); }
    .label-rose { color: var(--accent-rose); }

    .cw-explanation {
      background: rgba(167, 139, 250, 0.08);
      border: 1px solid rgba(167, 139, 250, 0.2);
      border-radius: var(--radius-sm);
      padding: 1rem;
    }

    .cw-expl-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--accent-violet);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }

    .cw-expl-text {
      font-size: 0.82rem;
      color: var(--text-secondary);
      line-height: 1.65;
    }

    /* ═══════════════════════════════════════
       BOTTOM GRID
    ═══════════════════════════════════════ */
    .cw-bottom-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1.4fr;
      gap: 1.25rem;
    }

    /* REVIEW */
    .cw-review-state {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .cw-review-state-label {
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    .cw-review-badge {
      font-size: 0.78rem;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 999px;
    }

    .review-pending { background: rgba(251,191,36,0.15); color: var(--accent-amber); border: 1px solid rgba(251,191,36,0.3); }
    .review-approved { background: rgba(52,211,153,0.15); color: var(--accent-emerald); border: 1px solid rgba(52,211,153,0.3); }
    .review-rejected { background: rgba(251,113,133,0.15); color: var(--accent-rose); border: 1px solid rgba(251,113,133,0.3); }
    .review-modify { background: rgba(167,139,250,0.15); color: var(--accent-violet); border: 1px solid rgba(167,139,250,0.3); }

    .cw-review-actions {
      display: flex;
      gap: 0.6rem;
    }

    /* ROI */
    .cw-roi-metrics {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .cw-roi-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.75rem;
      background: rgba(255,255,255,0.04);
      border-radius: var(--radius-sm);
      border: 1px solid rgba(255,255,255,0.07);
    }

    .cw-roi-icon {
      font-size: 1.25rem;
      width: 36px;
      text-align: center;
    }

    .cw-roi-info {
      display: flex;
      flex-direction: column;
    }

    .cw-roi-label {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .cw-roi-value {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    /* TABLE */
    .cw-table-wrap {
      overflow-x: auto;
    }

    .cw-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.82rem;
    }

    .cw-table th {
      padding: 0.6rem 0.85rem;
      text-align: left;
      font-size: 0.72rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted);
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }

    .cw-table td {
      padding: 0.65rem 0.85rem;
      color: var(--text-secondary);
      border-bottom: 1px solid rgba(255,255,255,0.05);
      vertical-align: middle;
    }

    .cw-table tr:last-child td {
      border-bottom: none;
    }

    .cw-table tr:hover td {
      background: rgba(255,255,255,0.03);
    }

    .cw-table-id {
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      color: var(--accent-blue) !important;
      font-weight: 600;
    }

    /* ═══════════════════════════════════════
       BADGES
    ═══════════════════════════════════════ */
    .cw-badge {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 999px;
    }

    .badge-blue { background: rgba(79,142,247,0.15); color: var(--accent-blue); border: 1px solid rgba(79,142,247,0.25); }
    .badge-violet { background: rgba(167,139,250,0.15); color: var(--accent-violet); border: 1px solid rgba(167,139,250,0.25); }
    .badge-emerald { background: rgba(52,211,153,0.15); color: var(--accent-emerald); border: 1px solid rgba(52,211,153,0.25); }
    .badge-amber { background: rgba(251,191,36,0.15); color: var(--accent-amber); border: 1px solid rgba(251,191,36,0.25); }
    .badge-rose { background: rgba(251,113,133,0.15); color: var(--accent-rose); border: 1px solid rgba(251,113,133,0.25); }

    /* ═══════════════════════════════════════
       BUTTONS
    ═══════════════════════════════════════ */
    .btn-primary-pill {
      background: linear-gradient(135deg, #4f8ef7, #6366f1);
      color: #fff;
      border: none;
      border-radius: 999px;
      padding: 0.55rem 1.4rem;
      font-size: 0.875rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all var(--transition-med);
      box-shadow: 0 4px 15px rgba(79,142,247,0.35);
    }

    .btn-primary-pill:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(79,142,247,0.5);
      filter: brightness(1.08);
    }

    .btn-primary-pill:active {
      transform: translateY(0);
    }

    .btn-wide {
      padding: 0.65rem 2rem;
    }

    .btn-glass {
      background: rgba(255,255,255,0.08);
      color: var(--text-primary);
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: 999px;
      padding: 0.55rem 1.2rem;
      font-size: 0.875rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-glass:hover {
      background: rgba(255,255,255,0.13);
      border-color: rgba(255,255,255,0.2);
    }

    .btn-ghost {
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 999px;
      padding: 0.45rem 1.1rem;
      font-size: 0.85rem;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-ghost:hover {
      color: var(--text-primary);
      border-color: rgba(255,255,255,0.25);
    }

    .btn-ghost-danger {
      background: transparent;
      color: var(--accent-rose);
      border: 1px solid rgba(251,113,133,0.25);
      border-radius: 999px;
      padding: 0.55rem 1.2rem;
      font-size: 0.875rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-ghost-danger:hover {
      background: rgba(251,113,133,0.1);
      border-color: rgba(251,113,133,0.4);
    }

    .btn-icon {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.1);
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }

    .btn-icon:hover {
      background: rgba(255,255,255,0.12);
      color: var(--text-primary);
      transform: rotate(15deg);
    }

    /* REVIEW BUTTONS */
    .btn-action {
      flex: 1;
      padding: 0.7rem 0.5rem;
      border-radius: var(--radius-sm);
      border: 1px solid transparent;
      font-size: 0.85rem;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      transition: all var(--transition-med);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
    }

    .btn-approve {
      background: rgba(52,211,153,0.12);
      color: var(--accent-emerald);
      border-color: rgba(52,211,153,0.25);
    }

    .btn-approve:hover {
      background: rgba(52,211,153,0.22);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(52,211,153,0.2);
    }

    .btn-reject {
      background: rgba(251,113,133,0.12);
      color: var(--accent-rose);
      border-color: rgba(251,113,133,0.25);
    }

    .btn-reject:hover {
      background: rgba(251,113,133,0.22);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(251,113,133,0.2);
    }

    .btn-modify {
      background: rgba(167,139,250,0.12);
      color: var(--accent-violet);
      border-color: rgba(167,139,250,0.25);
    }

    .btn-modify:hover {
      background: rgba(167,139,250,0.22);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(167,139,250,0.2);
    }

    /* SPINNER */
    .cw-spinner-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .cw-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.25);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* ═══════════════════════════════════════
       ANIMATIONS
    ═══════════════════════════════════════ */
    @keyframes fadeSlideUp {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* ═══════════════════════════════════════
       RESPONSIVE
    ═══════════════════════════════════════ */
    @media (max-width: 1200px) {
      .cw-stats-grid { grid-template-columns: repeat(2, 1fr); }
      .cw-content-grid { grid-template-columns: 1fr; }
      .cw-bottom-grid { grid-template-columns: 1fr 1fr; }
      .cw-claims-table-panel { grid-column: 1 / -1; }
    }

    @media (max-width: 768px) {
      .cw-nav-center { display: none; }
      .cw-page-title { font-size: 1.4rem; }
      .cw-stats-grid { grid-template-columns: 1fr 1fr; }
      .cw-bottom-grid { grid-template-columns: 1fr; }
      .cw-form-row { grid-template-columns: 1fr; }
      .cw-upload-row { grid-template-columns: 1fr; }
      
      /* Responsive Button Flows */
      .cw-form-actions {
        flex-direction: column;
        align-items: stretch;
        width: 100%;
        gap: 0.5rem;
      }
      .cw-form-actions button {
        width: 100%;
        justify-content: center;
      }
      .cw-review-actions {
        flex-direction: column;
        width: 100%;
        gap: 0.5rem;
      }
      .btn-action {
        width: 100%;
      }
    }
  `],
})
export class AppComponent implements OnInit {
  currentView = 'dashboard';
  claimantName = 'Ava Thompson';
  policyNumber = 'POL-2048';
  damageType = 'Rear bumper';
  damageDescription = 'Passenger-side rear impact with panel distortion and scratch segment.';
  activeClaimId = 'CLM-1001';
  reviewState = 'Pending Review';
  isLoading = false;

  selectedImage: File | null = null;
  selectedDoc: File | null = null;
  
  constructor(private http: HttpClient) {}

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

  recentClaims = [
    { id: 'CLM-1001', claimant: 'Ava Thompson', type: 'Vehicle', status: 'Approved', statusColor: 'emerald', amount: '$2,400' },
    { id: 'CLM-0998', claimant: 'Marcus Lee', type: 'Home', status: 'Pending', statusColor: 'amber', amount: '$8,100' },
    { id: 'CLM-0995', claimant: 'Sofia Reyes', type: 'Vehicle', status: 'Rejected', statusColor: 'rose', amount: '$1,200' },
    { id: 'CLM-0991', claimant: 'James Park', type: 'Auto', status: 'Approved', statusColor: 'emerald', amount: '$3,750' },
    { id: 'CLM-0988', claimant: 'Lily Chen', type: 'Home', status: 'Review', statusColor: 'violet', amount: '$15,200' },
  ];

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
    if (this.reviewState === 'Needs Correction') return 'review-modify';
    return 'review-pending';
  }

  ngOnInit(): void {
    this.fetchClaims();
  }

  fetchClaims(): void {
    this.http.get<any[]>('http://127.0.0.1:8000/api/claims').subscribe({
      next: (claims) => {
        this.recentClaims = claims.map(c => ({
          id: c.id,
          claimant: c.claimant_name,
          type: c.damage_type.split(' ')[0],
          status: c.status,
          statusColor: c.status === 'Approved' ? 'emerald' : c.status === 'Pending Review' ? 'amber' : c.status === 'Rejected' ? 'rose' : 'violet',
          amount: c.estimated_cost_range
        }));
      },
      error: (err) => console.error(err)
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

    this.http.post<any>('http://127.0.0.1:8000/api/claims/submit', formData).subscribe({
      next: (res) => {
        this.activeClaimId = res.claim.id;
        this.reviewState = res.claim.status;
        this.fetchClaims();
        
        this.http.post<any>('http://127.0.0.1:8000/api/claims/analyze', {}).subscribe({
          next: (aiRes) => {
            this.aiResult = {
              classification: aiRes.classification,
              severity: aiRes.severity,
              confidence: Math.round(aiRes.confidence_score * 100),
              estimatedCost: aiRes.estimated_cost_range,
              fraudRisk: Math.round(aiRes.fraud_risk_score * 100),
              explanation: aiRes.explanation,
            };
            this.isLoading = false;
          },
          error: (err) => { console.error(err); this.isLoading = false; }
        });
      },
      error: (err) => { console.error(err); this.isLoading = false; }
    });
  }

  submitReview(action: 'approve' | 'reject' | 'modify'): void {
    let decision = '';
    if (action === 'approve') decision = 'approved';
    else if (action === 'reject') decision = 'rejected';
    else decision = 'needs correction';

    this.http.patch<any>(`http://127.0.0.1:8000/api/claims/${this.activeClaimId}/review?decision=${decision}`, {}).subscribe({
      next: (res) => {
        this.reviewState = res.decision.charAt(0).toUpperCase() + res.decision.slice(1);
        this.fetchClaims();
      },
      error: (err) => console.error(err)
    });
  }

  generatePdfReport(): void {
    const url = `http://127.0.0.1:8000/api/reports/${this.activeClaimId}/pdf`;
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
        alert('PDF download failed. Please ensure the backend is running and a claim has been processed.');
      }
    });
  }
}

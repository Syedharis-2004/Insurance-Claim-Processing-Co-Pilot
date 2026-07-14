import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="cw-shell">

      <!-- ── NAVBAR ── -->
      <nav class="cw-nav">
        <div class="cw-nav-inner">
          <div class="cw-brand">
            <span class="cw-brand-icon">⚡</span>
            <span class="cw-brand-name">ClaimWise <span class="gradient-text">AI</span></span>
            <span class="cw-brand-badge">v2.0</span>
          </div>
          <div class="cw-nav-center">
            <a class="cw-nav-link" routerLink="/user" routerLinkActive="active">User Dashboard</a>
            <a class="cw-nav-link" routerLink="/admin" routerLinkActive="active">Admin Dashboard</a>
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
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: []
})
export class AppComponent {}

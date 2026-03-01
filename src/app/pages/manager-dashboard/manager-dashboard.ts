import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LeaveService } from '../../services/leave.service';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.css',
})
export class ManagerDashboard implements OnInit {
  username: string | null = '';
  leaves: any[] = [];
  loading = true;

  constructor(
  private authService: AuthService,
  private leaveService: LeaveService,
  private router: Router,
  private cdr: ChangeDetectorRef
) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
     const token = this.authService.getToken();
  console.log("Token at dashboard load:", token);

  if (token) {
    this.loadAllLeaves();
  } else {
    console.log("No token found");
  }
  }

  loadAllLeaves(): void {
  this.leaveService.getAllLeaves().subscribe({
    next: (data) => {
      console.log('Leaves data received:', data);

      this.leaves = Array.isArray(data) ? data : (data.leaves || []);
      console.log('Processed leaves:', this.leaves);

      this.loading = false;

      this.cdr.detectChanges();   // 🔥 IMPORTANT LINE
    },
    error: (error) => {
      console.error('Error loading leaves:', error);
      this.loading = false;
      this.cdr.detectChanges();   // 🔥 IMPORTANT LINE
    },
  });
}

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  approveLeave(leaveId: string): void {
    this.leaveService.updateLeaveStatus(leaveId, 'Approved').subscribe({
      next: (response) => {
        console.log('Leave approved:', response);
        this.loadAllLeaves();
      },
      error: (error) => {
        console.error('Error approving leave:', error);
      },
    });
  }

  rejectLeave(leaveId: string): void {
    this.leaveService.updateLeaveStatus(leaveId, 'Rejected').subscribe({
      next: (response) => {
        console.log('Leave rejected:', response);
        this.loadAllLeaves();
      },
      error: (error) => {
        console.error('Error rejecting leave:', error);
      },
    });
  }

  getStatusClass(status: string): string {
    if (!status) return '';
    switch (status.toLowerCase()) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved':
        return '✓';
      case 'rejected':
        return '✕';
      case 'pending':
        return '⏳';
      default:
        return '';
    }
  }
}

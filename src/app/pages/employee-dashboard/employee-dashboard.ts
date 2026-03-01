import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LeaveService } from '../../services/leave.service';
import { ApplyLeaveModalComponent } from '../../components/apply-leave-modal/apply-leave-modal.component';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, ApplyLeaveModalComponent],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.css',
})
export class EmployeeDashboard implements OnInit {
  username: string | null = '';
  leaves: any[] = [];
  loading = true;
  showModal = false;
  selectedLeave: any = null; 

  constructor(
  private authService: AuthService,
  private leaveService: LeaveService,
  private router: Router,
  
) {}
 
ngOnInit(): void {
   this.authService.currentUser$.subscribe(user => {
    if (user) {
      this.username = user.email?.split('@')[0] || '';
      this.loadLeaves();
    }
  });
}
  loadLeaves(): void {
    this.loading = true;
    
    this.leaveService.getMyLeaves().subscribe({
      next: (data) => {
        console.log('My leaves data received:', data);
        this.leaves = data.leaves ?? [];
        console.log('Processed leaves:', this.leaves);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading leaves:', error);
        if (error.status === 403) {
          console.error('Access denied - ensure your account has employee role');
        } else if (error.status === 401) {
          console.error('Unauthorized - token may be invalid');
        }
       
      },
    });
  }
  
  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openApplyLeaveModal(): void {
    this.selectedLeave = null;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onLeaveSubmitted(): void {
    this.closeModal();
    this.loadLeaves();
  }

  deleteLeave(leaveId: string): void {
    if (confirm('Are you sure you want to delete this leave?')) {
      this.leaveService.deleteLeave(leaveId).subscribe({
        next: () => {
          this.loadLeaves();
        },
        error: (error) => {
          console.error('Error deleting leave:', error);
        },
      });
    }
  }
  
   editLeave(leave: any): void {
  this.selectedLeave = leave;
  this.showModal = true;
  }

  getStatusClass(status: string): string {
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

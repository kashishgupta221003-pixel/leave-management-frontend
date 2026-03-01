import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LeaveService } from '../../services/leave.service';

@Component({
  selector: 'app-apply-leave-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './apply-leave-modal.component.html',
  styleUrl: './apply-leave-modal.component.css',
})
export class ApplyLeaveModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();
  @Input() leaveData: any = null;
  
  leaveForm!: FormGroup;
  submitted_form = false;
  loading = false;
  errorMessage = '';

  leaveTypes = ['Parental', 'Sick', 'Paid', 'Casual', 'Earned'];
  today = new Date().toISOString().split('T')[0];

  constructor(private formBuilder: FormBuilder, private leaveService: LeaveService) {}

  ngOnInit(): void {
    this.leaveForm = this.formBuilder.group({
      leave_type: ['', Validators.required],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]],
    });
     if (this.leaveData) {
      this.leaveForm.patchValue({
      leave_type: this.leaveData.leave_type,
      start_date: this.leaveData.start_date,
      end_date: this.leaveData.end_date,
      reason: this.leaveData.reason,
    });
  }
  }

  get f() {
    return this.leaveForm.controls;
  }

  onClose(): void {
    this.close.emit();
  }

  onDateChange(): void {
    // Update end_date min value when start_date changes
    const startDate = this.leaveForm.get('start_date')?.value;
    if (startDate) {
      this.leaveForm.get('end_date')?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    this.submitted_form = true;
    this.errorMessage = '';

    if (this.leaveForm.invalid) {
      return;
    }

    // Validate that end_date is not before start_date
    const startDate = new Date(this.leaveForm.get('start_date')?.value);
    const endDate = new Date(this.leaveForm.get('end_date')?.value);

    if (endDate < startDate) {
      this.errorMessage = 'End date must be after or equal to start date';
      return;
    }

    this.loading = true;

    const formData = {
      leave_type: this.leaveForm.get('leave_type')?.value,
      start_date: this.leaveForm.get('start_date')?.value,
      end_date: this.leaveForm.get('end_date')?.value,
      reason: this.leaveForm.get('reason')?.value,
    };
    // 🔥 EDIT MODE
    if (this.leaveData) {
    this.leaveService.updateLeave(this.leaveData.leave_id, formData).subscribe({
    next: (response) => {
      console.log('Leave updated successfully:', response);
      this.loading = false;
      this.submitted.emit();
    },
    error: (error) => {
      this.errorMessage = 'Error updating leave';
      this.loading = false;
    },
    });
  }
  // 🔥 CREATE MODE
  else {
  this.leaveService.submitLeave(formData).subscribe({
    next: (response) => {
      console.log('Leave submitted successfully:', response);
      this.loading = false;
      this.submitted.emit();
    },
    error: (error) => {
      this.errorMessage = 'Error submitting leave request';
      this.loading = false;
    },
  });
 }
    // this.leaveService.submitLeave(formData).subscribe({
    //   next: (response) => {
    //     console.log('Leave submitted successfully:', response);
    //     this.loading = false;
    //     this.submitted.emit();
    //   },
    //   error: (error) => {
    //     console.error('Leave submission error:', error);
    //     let errorMsg = 'Error submitting leave request';
        
    //     if (error.status === 403) {
    //       errorMsg = 'Permission denied. Your account may not have employee access.';
    //     } else if (error.status === 401) {
    //       errorMsg = 'Session expired. Please login again.';
    //     } else if (error.error?.detail) {
    //       errorMsg = error.error.detail;
    //     } else if (error.message) {
    //       errorMsg = error.message;
    //     }
        
    //     this.errorMessage = errorMsg;
    //     this.loading = false;
    //   },
    // });
  }
}

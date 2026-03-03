import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  private apiUrl = 'https://leave-management-backend-427919814652.asia-south1.run.app';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // });
private getHeaders(): HttpHeaders {
  const token = this.authService.getToken();

  return new HttpHeaders({
    Authorization: `Bearer ${token}`
  });
}

  submitLeave(leaveData: any): Observable<any> {
    console.log('Submitting leave with data:', leaveData);
    return this.http.post(`${this.apiUrl}/leaves/submit`, leaveData, {
      headers: this.getHeaders(),
    });
  }

  getMyLeaves(): Observable<any> {
    console.log('Fetching my leaves...');
    return this.http.get(`${this.apiUrl}/leaves/my-leaves`, {
      headers: this.getHeaders(),
    });
  }

  getAllLeaves(): Observable<any> {
    console.log('Fetching all leaves...');
    return this.http.get(`${this.apiUrl}/leaves/all-leaves`, {
      headers: this.getHeaders(),
    });
  }

  updateLeaveStatus(leaveId: string, status: string): Observable<any> {
    console.log(`Updating leave ${leaveId} status to ${status}`);
    return this.http.put(`${this.apiUrl}/leaves/${leaveId}/status?status=${status}`, {}, {
      headers: this.getHeaders(),
    });
  }
  
  updateLeave(leaveId: string, leaveData: any): Observable<any> {
  return this.http.put(
    `${this.apiUrl}/leaves/${leaveId}`,
    leaveData,
    { headers: this.getHeaders() }
  );
  }
  deleteLeave(leaveId: string): Observable<any> {
    console.log(`Deleting leave ${leaveId}`);
    return this.http.delete(`${this.apiUrl}/leaves/${leaveId}`, {
      headers: this.getHeaders(),
    });
  }

  getPendingLeaves(): Observable<any> {
    console.log('Fetching pending leaves...');
    return this.http.get(`${this.apiUrl}/leaves/pending`, {
      headers: this.getHeaders(),
    });
  }
}

# Leave Management System - Setup Guide

## Project Overview

A complete leave management system with:
- **Frontend**: Angular 21 with standalone components
- **Backend**: FastAPI with Firebase authentication and BigQuery integration
- **Database**: Google BigQuery for leave request storage
- **Cloud**: Cloud Run deployment with Scheduler and Cloud Functions

---

## Prerequisites

- Node.js (v18+)
- Python 3.9+
- Google Cloud Account with:
  - Firebase project setup
  - BigQuery dataset and table created
  - Service account credentials

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd c:\Users\Kashish_G\leave-management-frontend
npm install
```

### 2. Configure Firebase

Update `src/environments/firebase.config.ts` with your Firebase credentials:

```typescript
export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef123456',
};
```

Get these values from Firebase Console → Project Settings → General.

### 3. Configure Backend API URL

Update `src/app/services/leave.service.ts` with your backend URL:

```typescript
private apiUrl = 'http://localhost:8000'; // or your deployed backend URL
```

### 4. Run the Development Server

```bash
npm start
```

The app will open at `http://localhost:4200/`

---

## Backend Setup

### 1. Install Dependencies

```bash
cd C:\Users\Kashish_G\Desktop\leave-management-backend
pip install fastapi uvicorn firebase-admin google-cloud-bigquery python-dotenv
```

### 2. Setup Firebase Credentials

Place your Firebase service account JSON file in the backend directory:
- File: `firebase_key.json`

Update `firebase_config.py` if the path is different.

### 3. Setup BigQuery

Create a BigQuery dataset and table:

```sql
-- Create Dataset
CREATE SCHEMA leave_management.leave_requests;

-- Create Table
CREATE TABLE leave_management.leave_requests (
  leave_id STRING NOT NULL,
  employee_id STRING NOT NULL,
  start_date STRING NOT NULL,
  end_date STRING NOT NULL,
  reason STRING NOT NULL,
  leave_type STRING NOT NULL,
  status STRING DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP,
  is_deleted BOOL DEFAULT FALSE
);
```

### 4. Configure Backend

Update your `main.py` BigQuery client to use your Google Cloud project:

```python
client = bigquery.Client(project='your-gcp-project-id')
```

### 5. Run the Backend

```bash
uvicorn main:app --reload --port 8000
```

The API will run at `http://localhost:8000/`

---

## Test Credentials

### Demo Users (in Firebase):

**Employee:**
- Email: employee@example.com
- Password: password123
- Role: employee

**Manager:**
- Email: manager@example.com  
- Password: password123
- Role: manager

*Note: Create these users in Firebase Authentication console*

---

## Features Implemented

### ✅ Frontend Features

1. **Login Screen**
   - Email and password validation
   - Error messages displayed in red
   - Submit button disabled until form is valid
   - Redirect to dashboard based on role

2. **Employee Dashboard**
   - Welcome navbar with username (background: #002259)
   - Leave history table with all columns:
     - ID (truncated UUID - 9 characters)
     - Leave Type, Start Date, End Date, Reason
     - Status with dynamic colors (Pending/Approved/Rejected)
     - Delete button (enabled only for pending leaves)
   - Logout button on navbar

3. **Apply Leave Modal**
   - Leave Type dropdown (Parental, Sick, Paid, Casual, Earned)
   - Start Date (min: today)
   - End Date (min: start date)
   - Reason (textarea, min 10 characters)
   - Form validation with error messages
   - Submit button disabled until form valid

4. **Manager Dashboard**
   - View all leave requests from employees
   - Approve/Reject buttons (enabled only for pending)
   - Status display with dynamic updates
   - Welcome navbar (background: #000)
   - Logout button

5. **Route Guards**
   - AuthGuard: Protects routes from unauthenticated users
   - RoleGuard: Ensures users can only access their role's dashboard
   - Auto-redirect to dashboard if already logged in
   - Auto-redirect to login on logout

### ✅ Backend Features

1. **Authentication**
   - Firebase ID token verification
   - Role-based access control

2. **Leave Management APIs**
   - POST `/leaves/submit` - Submit leave request
   - GET `/leaves/my-leaves` - Get employee's leaves
   - GET `/leaves/all-leaves` - Get all leaves (manager only)
   - PUT `/leaves/{leave_id}/status` - Update leave status (manager only)
   - DELETE `/leaves/{leave_id}` - Soft delete leave
   - GET `/leaves/pending` - Get pending leaves for notifications

3. **BigQuery Integration**
   - Store all leave requests
   - Track leave history
   - Soft delete (flag-based, not actual deletion)

---

## Deployment

### Frontend Deployment (Cloud Run)

```bash
# Build the app
ng build --configuration production

# Create Dockerfile (included in project)
docker build -t gcr.io/your-project/leave-frontend .
docker push gcr.io/your-project/leave-frontend

# Deploy to Cloud Run
gcloud run deploy leave-frontend --image gcr.io/your-project/leave-frontend --platform managed
```

### Backend Deployment (Cloud Run)

```bash
# Create Dockerfile for FastAPI
docker build -t gcr.io/your-project/leave-backend .
docker push gcr.io/your-project/leave-backend

# Deploy to Cloud Run
gcloud run deploy leave-backend --image gcr.io/your-project/leave-backend --platform managed
```

### Cloud Scheduler & Cloud Function

Create a Cloud Function to check pending leaves hourly:

```python
# Cloud Function (check_pending_leaves/main.py)
from google.cloud import bigquery
import functions_framework

@functions_framework.http
def check_pending_leaves(request):
    client = bigquery.Client()
    # Query pending leaves
    query = """
    SELECT * FROM `your-project.leave_management.leave_requests`
    WHERE status = 'Pending' AND is_deleted = False
    """
    results = client.query(query).result()
    
    # Send notifications to managers
    # Implementation depends on your email service
    
    return 'OK', 200
```

Setup Cloud Scheduler to trigger this function every hour.

---

## File Structure

```
leave-management-frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   └── apply-leave-modal/
│   │   ├── core/
│   │   │   └── guards/
│   │   │       ├── auth.guard.ts
│   │   │       └── role.guard.ts
│   │   ├── pages/
│   │   │   ├── login/
│   │   │   ├── employee-dashboard/
│   │   │   └── manager-dashboard/
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.interceptor.ts
│   │   │   └── leave.service.ts
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   └── app.ts
│   ├── environments/
│   │   └── firebase.config.ts
│   └── index.html
├── angular.json
├── package.json
└── tsconfig.json

leave-management-backend/
├── main.py
├── auth.py
├── models.py
├── bigquery_client.py
├── firebase_config.py
├── firebase_key.json
└── requirements.txt
```

---

## Troubleshooting

### Firebase Authentication Issues
- Ensure Firebase project is in the same Google Cloud project as BigQuery
- Check user creation in Firebase Authentication console
- Verify CORS is enabled in backend

### BigQuery Connection Issues
- Verify service account has BigQuery admin role
- Check table and dataset names match
- Ensure Google Cloud project ID is correct

### CORS Errors
- Backend should have CORS middleware enabled (already in main.py)
- Verify frontend URL is accessible from backend

---

## Additional Configuration

### Email Notifications (Cloud Function)

For the Cloud Scheduler to send email notifications:

1. Create a Cloud Function with email service (SendGrid, Mailgun, etc.)
2. Update `bigquery_client.py` to include manager email mapping
3. Schedule the function to run hourly

### Custom Styling

- Modify `.css` files in components/pages for custom styling
- Use Bootstrap classes (already installed) for additional styling
- Main colors: #002259 (Employee navbar), #000 (Manager navbar)

---

## Next Steps

1. ✅ Configure Firebase credentials
2. ✅ Setup BigQuery tables
3. ✅ Deploy backend to Cloud Run
4. ✅ Deploy frontend to Cloud Run
5. ✅ Setup Cloud Scheduler and Cloud Function for notifications
6. ✅ Test all features

---

## Support

For issues or questions, refer to:
- [Angular Documentation](https://angular.io)
- [Firebase Documentation](https://firebase.google.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [BigQuery Documentation](https://cloud.google.com/bigquery/docs)

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword,createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';


// Firebase Configuration
// const firebaseConfig = {
//   apiKey: "__apiKey__",
//   authDomain: "__authDomain__",
//   projectId: "__projectId__",
//   storageBucket: "__storageBucket__",
//   messagingSenderId: "__messagingSenderId__",
//   appId: "__appId__"
// };
const firebaseConfig = {
  apiKey: "AIzaSyDhg39RSx8_GKF9VNIrkGIUqNtghe1xP_A",
  authDomain: "kasishgupta-project.firebaseapp.com",
  projectId: "kasishgupta-project",
  storageBucket: "kasishgupta-project.firebasestorage.app",
  messagingSenderId: "427919814652",
  appId: "1:427919814652:web:a2fc43c49bdada39bbcc79"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('authToken'));
  public token$ = this.tokenSubject.asObservable();

  private userRoleSubject = new BehaviorSubject<string | null>(localStorage.getItem('userRole'));
  public userRole$ = this.userRoleSubject.asObservable();

  private usernameSubject = new BehaviorSubject<string | null>(localStorage.getItem('username'));
  public username$ = this.usernameSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.initAuthStateListener();
  }

  private initAuthStateListener() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        this.setToken(token);
        this.currentUserSubject.next(user);
      } else {
        this.setToken(null);
        this.currentUserSubject.next(null);
      }
    });
  }
  
  login(email: string, password: string): Promise<any> {
    return signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Force refresh to get updated custom claims
        const token = await userCredential.user.getIdToken(true);
        const username = userCredential.user.email?.split('@')[0] || 'User';
        const uid = userCredential.user.uid;

        localStorage.setItem('authToken', token);
        localStorage.setItem('userId', uid);
      localStorage.setItem('username', username); 

        // Fetch user role from backend
        return this.fetchUserRole(token).then((role) => {
          this.setUserRole(role);
          this.currentUserSubject.next(userCredential.user);
          return { user: userCredential.user, role, token };
        });
      })
      .catch((error) => {
        // Provide detailed error message based on error code
        console.error('Login error:', error);
        let errorMessage = 'Wrong credentials';
        
        if (error.code === 'auth/user-not-found') {
          errorMessage = 'User not found. Please check demo credentials.';
        } else if (error.code === 'auth/wrong-password') {
          errorMessage = 'Wrong password';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Invalid username format';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
      });
  }
      signup(email: string, password: string): Promise<any> {
      return createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {

      const user = userCredential.user;

       // 🔥 Get initial token
      const token = await user.getIdToken();

      // 🔥 Call backend to assign role
      await this.http.post(
        'http://localhost:8000/assign-role',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      ).toPromise();

      // 🔥 Wait 1 second to allow Firebase to attach custom claim
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 🔥 Now force refresh token
      const refreshedToken = await user.getIdToken(true);

      const username = user.email?.split('@')[0] || 'User';

      localStorage.setItem('authToken', refreshedToken);
      localStorage.setItem('userId', user.uid);
      localStorage.setItem('username', username);

      this.currentUserSubject.next(user);

      return { user, role: 'employee' };
    })
    .catch((error) => {
      console.log("Full Firebase Error:", error);
      let errorMessage = 'Signup failed';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already exists';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password must be at least 6 characters';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      }

      throw new Error(errorMessage);
    });
}
  private fetchUserRole(token: string): Promise<string> {
    // Decode JWT to get role from custom claims
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Check custom claims for role
      const role = payload.role || payload.custom_role || 'employee';
      return Promise.resolve(role);
    } catch (error) {
      console.error('Error decoding token:', error);
      return Promise.resolve('employee');
    }
  }

  logout(): Promise<void> {
    return signOut(auth).then(() => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('username');

      this.tokenSubject.next(null);
      this.userRoleSubject.next(null);
      this.usernameSubject.next(null);
      this.currentUserSubject.next(null);

      this.router.navigate(['/login']);
    });
  }

 private setToken(token: string | null) {
    if (token) {
      localStorage.setItem('Token', token);
    } else {
      localStorage.removeItem('Token');
    }
    this.tokenSubject.next(token);
  }

  private setUserRole(role: string) {
    localStorage.setItem('userRole', role);
    this.userRoleSubject.next(role);
  }

  private setUsername(username: string) {
    localStorage.setItem('username', username);
    this.usernameSubject.next(username);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isManager(): boolean {
    return this.getUserRole() === 'manager';
  }

  isEmployee(): boolean {
    return this.getUserRole() === 'employee';
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

}

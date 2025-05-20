import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { catchError, firstValueFrom, Observable, of, throwError } from 'rxjs'
import { Users } from '../schema/schema' // Import Users class
import { UsersData } from '../schema/dummy'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { environment } from 'src/environment/environment'

export type User = Users // Correctly export `User` type

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: User[] = []
  private user?: User
  private readonly USERS_STORAGE_KEY = 'users'

  // For testing, simulate a logged-in user
  private currentUser = {
    id: 'end-user-001', // Change this to test different scenarios:
    // 'end-user-001' - for end user
    // 'user-001' - for supplier ABC Office Supplies
    // 'user-002' - for supplier XYZ Electronics
    // 'user-003' - for supplier Premier Furniture
    fullname: 'Test User',
    username: 'testuser',
    role: 'enduser' // Change to 'supplier' to test supplier view
  };

  constructor(private router: Router, private http: HttpClient) {
    this.loadUsers()
  }

  private apiUrl = environment.api; // Base URL of your API
  private tokenKey = 'user'; // Key for storing the JWT token in localStorage
  private refreshTokenKey = 'refresh_token';
  // Login method that stores user data after successful login

   // Set a cookie with the provided name, value, and expiration days
   private setCookie(name: string, value: string, days: number): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000); // Set expiration time
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/`;
  }

  // Get a cookie value by name
  private getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // Delete a cookie by name
  private deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  }

  // Store the JWT access token in cookies
  private setToken(token: string): void {
    this.setCookie(this.tokenKey, token, 1/24); // 1 hour expiration
  }

  // Store the refresh token in cookies
  private setRefreshToken(refreshToken: string): void {
    this.setCookie(this.refreshTokenKey, refreshToken, 7); // 7 days expiration
  }

  // Get the JWT access token from cookies
  getToken(): string | null {
    return this.getCookie(this.tokenKey);
  }

  // Get the refresh token from cookies
  private getRefreshToken(): string | null {
    return this.getCookie(this.refreshTokenKey);
  }

  // Remove the JWT access token from cookies
  private removeToken(): void {
    this.deleteCookie(this.tokenKey);
  }

  // Remove the refresh token from cookies
  private removeRefreshToken(): void {
    this.deleteCookie(this.refreshTokenKey);
  }

  refreshTokenPeriodically(): void {
    const refreshInterval = 50 * 60 * 1000; // Refresh every 55 minutes (in milliseconds)
  
    // Set an interval to refresh the token periodically
    setInterval(async () => {
        try {
         await this.refreshToken(); // Call refreshToken method to get new access token
        } catch (error) {
        }
    
    }, refreshInterval);
  }

  // Refresh the token by sending the refresh token to the server (returns a Promise)
  async refreshToken(): Promise<any> {
    if(environment.use=='local'){
      this.setToken(JSON.stringify(this.user));
    }else{
      const refreshToken = this.getRefreshToken();
  
      if (!refreshToken) {
        return undefined;
      }
  
      const url = `${this.apiUrl}/auth/refresh`; // Assuming the backend provides a refresh endpoint
      try {
        const response = await this.http.post<any>(url, { refreshToken }).toPromise();
        if (response.token) {
          // Store the new access token
          this.setToken(response.token);
          return response.token;
        }
      } catch (error) {
        return undefined;
      }
    }
  }

  


  // Fetch the user data from the protected route
  async getUserData(): Promise<any> {
    const token = this.getToken();
    if (!token) {
      return undefined
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = `${this.apiUrl}/auth/protected`;

    try {
      const userData = await firstValueFrom(this.http.get<any>(url, { headers })
      .pipe(
        catchError((error: any) => {
          
          // Throw the error instead of returning it
          return throwError(() => new Error('Invalid!'));
        })
      )
    )
      return userData;
    } catch (error) {
      return undefined
    }
  }

  // Store user data in localStorage
  async setUserData(): Promise<void> {
    if(environment.use == 'local'){
      this.user = this.getUser();
      if(this.user){
          this.refreshToken();
          this.refreshTokenPeriodically();
      }
    }else{
      try {
        this.user = await this.getUserData();
        
      } catch (error) {
        throw error;
      }
    }
  }



  // Check if the user is authenticated (i.e., if a token exists)
  isAuthenticated(): boolean {
    return !!this.getToken()
  }


  private generateId(): string {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  }

  private loadUsers() {
    const storedUsers = localStorage.getItem(this.USERS_STORAGE_KEY)

    if (storedUsers) {
      this.users = JSON.parse(storedUsers)
    } else {
      this.users = [...UsersData] // Load dummy data if no stored users
      this.saveUsers()
    }
  }

  private saveUsers() {
    localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(this.users))
  }

  getAllUsers(): Observable<User[]> {
    return of(this.users)
  }

  getUserById(userId: string): User | undefined {
    return this.users.find(user => user.id === userId)
  }

  addUser(userData: Omit<User, 'id'>): Observable<User> {
    if (this.users.some(u => u.username === userData.username)) {
      return throwError(() => new Error('Username already exists'))
    }

    const newUser: User = {
      ...userData,
      id: this.generateId(),
      profile: userData.profile || 'default-profile-pic-url',
      isAdmin: userData.user_type === 'SuperAdmin' || userData.user_type === 'Admin'
    }

    this.users.push(newUser)
    this.saveUsers()
    return of(newUser)
  }

  async login(username: string, password: string) {


    if (environment.use == 'local') {
      this.loadUsers()

      const foundUser = this.users.find(u => u.username === username)
      if (!foundUser) throw new Error('User not found.')

      if (foundUser.password === password) {
        this.user = foundUser
        this.setToken(JSON.stringify(this.user))
        return foundUser
      } else {
        throw new Error('Invalid credentials.')
      }

    } else {
      const url = `${this.apiUrl}/auth/login`;
      try {
        const response = await firstValueFrom(this.http.post<any>(url, { username, password }));
        if (response.accessToken && response.refreshToken) {
          // Store both access token and refresh token in cookies
          this.setToken(response.accessToken);
          this.setRefreshToken(response.refreshToken);
          await this.setUserData();
        }
  
        return response;
      } catch (error:any) {
        let errorMessage = 'An unknown error occurred. Please try again later.';
        if (error.status === 400 && error.error && error.error.error) {
          errorMessage = error.error.error;
        } else if (error.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        throw new Error(errorMessage);
      }
    }
  }

  async logout() {
    this.removeToken();
    this.removeRefreshToken();
    this.user = undefined
    this.router.navigate(['/authentication/login'])
  }

  getUser(): User | undefined {
    if (environment.use == 'local') {
      try{
        const userString = this.getToken()
        return userString ? (JSON.parse(userString) as User) : undefined
      }catch(e){
        return undefined
      }
    } else {
      return this.user ;
    }
  }

  updateUser(userId: string, updatedData: Partial<User>): Observable<User> {
    const userIndex = this.users.findIndex(user => user.id === userId)

    if (userIndex === -1) {
      return throwError(() => new Error('User not found'))
    }

    // ✅ Keep existing values and update only the provided fields
    this.users[userIndex] = { ...this.users[userIndex], ...updatedData }

    this.saveUsers()
    return of(this.users[userIndex]) // ✅ Return updated user
  }

  deleteUser(userId: string): Observable<boolean> {
    const userIndex = this.users.findIndex(user => user.id === userId)

    if (userIndex === -1) {
      return throwError(() => new Error('User not found'))
    }

    this.users.splice(userIndex, 1) // ✅ Remove user from the array
    this.saveUsers()

    return of(true) // ✅ Return success
  }

  isSupplier() {
    return this.currentUser.role === 'supplier';
  }

  isEndUser() {
    return this.currentUser.role === 'enduser' || this.currentUser.role === 'supply';
  }
}

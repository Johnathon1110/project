import { Injectable } from '@angular/core';
import { User, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private users: User[] = [
    {
      id: 1,
      fullName: 'Ahmed Ali',
      email: 'worker@test.com',
      password: '123456',
      role: 'worker',
      phone: '01000000000',
      location: 'Cairo',
      skills: ['Delivery', 'Cleaning'],
      experience: '1 year',
      availability: 'Evening',
      rating: 4.5
    },
    {
      id: 2,
      fullName: 'Sara Mohamed',
      email: 'owner@test.com',
      password: '123456',
      role: 'owner',
      phone: '01111111111',
      location: 'Giza',
      rating: 4.8
    },
    {
      id: 999,
      fullName: 'Admin',
      email: 'admin@test.com',
      password: '123456',
      role: 'admin',
      phone: '01099999999',
      location: 'Cairo',
      rating: 5
    }
  ];

  private currentUserKey = 'smarttask_current_user';
  private usersKey = 'smarttask_users';

  constructor() {
    const savedUsers = localStorage.getItem(this.usersKey);

    if (savedUsers) {
      this.users = JSON.parse(savedUsers);
    } else {
      localStorage.setItem(this.usersKey, JSON.stringify(this.users));
    }
  }

  register(userData: Omit<User, 'id'>): { success: boolean; message: string } {
    const existingUser = this.users.find(user => user.email === userData.email);

    if (existingUser) {
      return { success: false, message: 'Email already exists' };
    }

    const newUser: User = {
      id: this.users.length + 1,
      ...userData
    };

    this.users.push(newUser);
    localStorage.setItem(this.usersKey, JSON.stringify(this.users));

    return { success: true, message: 'Registration successful' };
  }

  login(email: string, password: string): { success: boolean; user?: User; message: string } {
    const user = this.users.find(
      u => u.email === email && u.password === password
    );

    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }

    localStorage.setItem(this.currentUserKey, JSON.stringify(user));

    return { success: true, user, message: 'Login successful' };
  }

  logout(): void {
    localStorage.removeItem(this.currentUserKey);
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem(this.currentUserKey);
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  getRole(): UserRole | null {
    return this.getCurrentUser()?.role || null;
  }

  updateUser(updatedUser: any): void {
  const users = JSON.parse(localStorage.getItem('smarttask_users') || '[]');

  const index = users.findIndex((u: any) => u.id === updatedUser.id);

  if (index !== -1) {
    users[index] = updatedUser;
    localStorage.setItem('smarttask_users', JSON.stringify(users));
    localStorage.setItem('smarttask_current_user', JSON.stringify(updatedUser));
  }
}

  getAllUsers(): any[] {
  return JSON.parse(localStorage.getItem('smarttask_users') || '[]');
}

}



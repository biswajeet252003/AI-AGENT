import { User } from '../types';

const USERS_KEY = 'nox_users';
const CURRENT_USER_KEY = 'nox_current_user';

export const authService = {
  getUsers: (): User[] => {
    const usersStr = localStorage.getItem(USERS_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  login: (email: string, password: string): User => {
    const users = authService.getUsers();
    
    // Check if user exists
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error('No account found with this email. Please Sign Up first.');
    }
    
    // Check password
    if (user.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  },

  loginAsGuest: (): User => {
    const guestUser: User = {
      id: 'guest-' + Date.now(),
      name: 'Guest User',
      email: 'guest@nox.ai',
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(guestUser));
    return guestUser;
  },

  signup: (name: string, email: string, password: string): User => {
    const users = authService.getUsers();
    
    if (users.some(u => u.email === email)) {
      throw new Error('An account with this email already exists.');
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    
    return newUser;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

import { User } from '../types';

const USERS_STORAGE_KEY = 'extraque_users';
const SESSION_STORAGE_KEY = 'extraque_session';

const DEFAULT_USER: User = {
  id: 'test-user',
  email: 'test@example.com',
  name: 'Demo User',
  is_premium: true
};

export const AuthService = {
  getUsers: (): User[] => {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    let users = stored ? JSON.parse(stored) : [];
    
    // Seed default user if none exist
    if (users.length === 0) {
      users = [DEFAULT_USER];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
    
    return users;
  },

  signup: async (email: string, name: string, password: string): Promise<User> => {
    // Artificial delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users = AuthService.getUsers();
    if (users.find(u => u.email === email)) {
      throw new Error("Account already exists with this email.");
    }

    const newUser: User = {
      id: Math.random().toString(36).substring(2, 11),
      email,
      name,
      is_premium: false
    };

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([...users, newUser]));
    return newUser;
  },

  login: async (email: string, password: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const users = AuthService.getUsers();
    const user = users.find(u => u.email === email);
    
    // For the seeded test user, we enforce 'password123'
    if (email === 'test@example.com' && password !== 'password123') {
        throw new Error("Invalid email or password.");
    }

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    // In a real app we'd verify the password hash properly
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  },

  getCurrentUser: (): User | null => {
    const session = localStorage.getItem(SESSION_STORAGE_KEY);
    return session ? JSON.parse(session) : null;
  }
};

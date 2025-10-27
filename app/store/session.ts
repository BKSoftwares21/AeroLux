import type { User } from "../services/api";
import { setCurrentUser } from "./bookingsStore";
import { api } from "../services/api";

let _currentUser: User | null = null;
let _isAuthenticated = false;

export const session = {
  get user() {
    return _currentUser;
  },
  
  get isAuthenticated() {
    return _isAuthenticated && _currentUser !== null;
  },
  
  setUser(u: User | null) {
    _currentUser = u;
    _isAuthenticated = u !== null;
    if (u) {
      setCurrentUser(u.id);
    }
  },
  
  async refreshProfile(): Promise<User | null> {
    if (!_currentUser) return null;
    
    try {
      const response = await api.getCurrentProfile(_currentUser.id);
      if (response.user) {
        _currentUser = response.user;
        return response.user;
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      // If refresh fails, clear the session
      this.logout();
    }
    return null;
  },
  
  async updateProfile(updates: Partial<{ full_name: string; phone?: string; date_of_birth?: string; id_or_passport?: string }>): Promise<boolean> {
    if (!_currentUser) return false;
    
    try {
      const response = await api.updateOwnProfile(_currentUser.id, updates);
      if (response.user) {
        _currentUser = response.user;
        return true;
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
    return false;
  },
  
  logout() {
    _currentUser = null;
    _isAuthenticated = false;
  },
};

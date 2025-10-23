import type { User } from "../services/api";

let _currentUser: User | null = null;

export const session = {
  get user() {
    return _currentUser;
  },
  setUser(u: User | null) {
    _currentUser = u;
  },
};

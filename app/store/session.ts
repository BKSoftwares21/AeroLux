import type { User } from "../services/api";
import { setCurrentUser } from "./bookingsStore";

let _currentUser: User | null = null;

export const session = {
  get user() {
    return _currentUser;
  },
  setUser(u: User | null) {
    _currentUser = u;
    if (u) {
      setCurrentUser(u.id);
    }
  },
};

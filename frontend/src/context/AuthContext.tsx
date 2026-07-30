'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import Cookies from 'js-cookie';

export type Role = 'CUSTOMER' | 'RESTAURANT_OWNER' | 'ADMIN';

type AuthUser = {
  userId: number;
  role: Role;
};

type AuthContextType = {
  token: string | null;
  user: AuthUser | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Reads the payload out of a JWT without verifying it.
 *
 * A JWT is three base64url-encoded parts separated by dots: header.payload.signature
 * The payload is readable by anyone holding the token — it is NOT encrypted.
 * This is safe for deciding what to show in the UI, but it proves nothing:
 * only the backend can verify the signature, so the backend remains the
 * sole enforcer of what a user is actually allowed to do.
 */
function decodeToken(token: string): AuthUser | null {
  try {
    const payload = token.split('.')[1];
    const normalised = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalised));

    if (typeof decoded.userId !== 'number' || typeof decoded.role !== 'string') {
      return null;
    }

    return { userId: decoded.userId, role: decoded.role as Role };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = Cookies.get('token');
    if (savedToken) {
      const decoded = decodeToken(savedToken);
      if (decoded) {
        setToken(savedToken);
        setUser(decoded);
      } else {
        // token is malformed — clear it rather than half-trusting it
        Cookies.remove('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string) => {
    const decoded = decodeToken(newToken);
    Cookies.set('token', newToken, { expires: 1 });
    setToken(newToken);
    setUser(decoded);
  };

  const logout = () => {
    Cookies.remove('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}
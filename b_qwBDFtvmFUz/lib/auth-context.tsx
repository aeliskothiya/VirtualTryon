"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { userProfile } from "./mock-data";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ["/home", "/login", "/register", "/forgot-password", "/reset-password"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for stored auth on mount
    const storedUser = localStorage.getItem("wardrobe_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Redirect logic
    if (!isLoading) {
      const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));
      
      if (!user && !isPublicRoute) {
        router.push("/home");
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: "1",
      name: userProfile.name,
      email: email,
      avatar: userProfile.avatar,
    };
    
    setUser(mockUser);
    localStorage.setItem("wardrobe_user", JSON.stringify(mockUser));
    router.push("/");
  };

  const register = async (name: string, email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: "1",
      name: name,
      email: email,
      avatar: userProfile.avatar,
    };
    
    setUser(mockUser);
    localStorage.setItem("wardrobe_user", JSON.stringify(mockUser));
    router.push("/");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("wardrobe_user");
    router.push("/home");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

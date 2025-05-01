import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLoginResponse } from "./LogingScreen";
import { ILoginResponse } from "../config/types";

interface AuthContextType {
  user: ILoginResponse | null;
  loading: boolean;
  login: (userData: ILoginResponse) => Promise<boolean>;
  logout: () => Promise<boolean>;
  isLoggedIn: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<ILoginResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getLoginResponse();
        setUser(userData);
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (userData: ILoginResponse) => {
    try {
      await AsyncStorage.setItem("loginResponse", JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("loginResponse");
      setUser(null);
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  };

  const isLoggedIn = () => {
    return user !== null;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isLoggedIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

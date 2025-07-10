import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserData {
  _id: string;
  nombre: string;
  fechaNacimiento: string;
  objetivo?: string;
  genero?: string;
  altura?: number;
  peso?: number;
}

interface AuthContextProps {
  user: UserData | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (user: UserData, token: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  token: null,
  loading: false,
  error: null,
  login: async () => {},
  logout: async () => {},
  restoreSession: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    setLoading(true);
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const storedToken = await AsyncStorage.getItem("token");
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (err) {
      setError("Error al restaurar la sesión");
    } finally {
      setLoading(false);
    }
  };

  const login = async (user: UserData, token: string) => {
    try {
      setUser(user);
      setToken(token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      await AsyncStorage.setItem("token", token);
      setError(null);
    } catch (err) {
      setError("Error al guardar la sesión");
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");
      setError(null);
    } catch (err) {
      setError("Error al cerrar sesión");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        logout,
        restoreSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

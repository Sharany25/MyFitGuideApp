import { useState } from "react";
import { API_URL } from "../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "../context/UserContext";

interface LoginData {
  correoElectronico: string;
  contraseña: string;
}

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { dispatch } = useUser();

  const login = async (data: LoginData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}Usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (response.ok && result) {
        dispatch({ type: 'SET_USER', payload: result });
        await AsyncStorage.setItem("userProfile", JSON.stringify(result));
        return result;
      } else {
        setError("Correo o contraseña incorrectos");
        dispatch({ type: 'CLEAR_USER' });
        return null;
      }
    } catch (e) {
      setError("Error de conexión");
      dispatch({ type: 'CLEAR_USER' });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

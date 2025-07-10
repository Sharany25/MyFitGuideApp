import { useState } from "react";
import { API_URL } from "../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "../context/UserContext"; // o useAuth, según tu contexto

interface LoginData {
  correoElectronico: string;
  contraseña: string;
}

// Suponiendo que tu API regresa { user, token }
export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { dispatch } = useUser(); // actualiza el contexto global

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

      // Este bloque depende de la estructura de tu backend
      if (response.ok && result) {
        // Guarda usuario y/o token en storage/context
        dispatch({ type: 'SET_USER', payload: result }); // si tu contexto lo permite
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

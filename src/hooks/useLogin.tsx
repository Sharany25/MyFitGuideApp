import { useState } from "react";

interface LoginData {
  correoElectronico: string;
  contraseña: string;
}

interface UserData {
  _id: string;
  nombre: string;
  fechaNacimiento: string;
  objetivo?: string;
  genero?: string;
  altura?: number;
  peso?: number;
  // agrega más campos si necesitas
}

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);

  const login = async (data: LoginData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://192.168.1.11:3000/MyFitGuide/Usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok && result) {
        setUser(result);
        return result;
      } else {
        setError("Correo o contraseña incorrectos");
        setUser(null);
        return null;
      }
    } catch (e) {
      setError("Error de conexión");
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error, user };
};

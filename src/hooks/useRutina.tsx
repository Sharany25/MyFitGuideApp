import { useState } from "react";

export interface RutinaPayload {
  userId: string;
  nombre: string;
  edad: number;
  objetivo: string;
  preferencias: string[];
  dias: number;
  lesiones: string;
}

export const useRutina = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const generarRutina = async (payload: RutinaPayload): Promise<boolean> => {
    setLoading(true);
    setSuccess(false);
    setError(false);

    try {
      const response = await fetch("http://192.168.1.11:3000/MyFitGuide/prueba-rutina", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(true);
        return true;
      } else {
        setError(true);
        return false;
      }
    } catch {
      setError(true);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { 
    generarRutina,
    loading,
    success,
    error,
    setSuccess,
    setError
  };
};

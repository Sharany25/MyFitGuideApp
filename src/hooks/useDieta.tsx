import { useState } from "react";
import { API_URL } from "../api/api";

interface DietaData {
  userId: string;
  genero: 'masculino' | 'femenino';
  altura: number;
  peso: number;
  objetivo: string;
  alergias: string[];
  presupuesto: number;
}

export const useDieta = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const enviarDieta = async (data: DietaData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${API_URL}dieta-ia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        return result;
      } else {
        setError(result.message || "Error al guardar datos");
        return null;
      }
    } catch (e) {
      setError("Hubo un problema al enviar los datos");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const obtenerDietaPorUsuario = async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}dieta-ia/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo obtener la dieta");
      }

      return data;
    } catch (e: any) {
      setError(e.message || "Error desconocido");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    enviarDieta,
    obtenerDietaPorUsuario,
    loading,
    error,
    success,
    setSuccess,
    setError,
  };
};

export const useGetDietaPorUsuario = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerDietaPorUsuario = async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}dieta-ia/${userId}`);
      const result = await response.json();

      if (response.ok) {
        setData(result);
      } else {
        setError(result.message || "Error al obtener dieta");
      }
    } catch (e) {
      setError("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return { obtenerDietaPorUsuario, data, loading, error };
};

import { useState } from "react";
import { API_URL } from "../api/api";

export interface RutinaPayload {
  userId: string;
  nombre: string;
  edad: number;
  objetivo: string;
  preferencias: string[];
  dias: number;
  lesiones: string;
}

export interface RutinaResponse {
  userId: string;
  rutina: {
    objetivo_rutina: string;
    rutina: {
      dia: string;
      grupo: string;
      ejercicios: {
        nombre: string;
        series: number;
        repeticiones: number;
        descanso: string;
        propósito: string;
      }[];
    }[];
  };
  creado: string;
}

export const useRutina = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generarRutina = async (payload: RutinaPayload): Promise<RutinaResponse | null> => {
    setLoading(true);
    setSuccess(false);
    setError(false);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_URL}rutinas-ia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        setError(true);
        setErrorMessage(errText);
        return null;
      }

      await new Promise((res) => setTimeout(res, 800));

      return await obtenerRutinaPorId(payload.userId);
    } catch {
      setError(true);
      setErrorMessage("No se pudo conectar con el servidor.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const obtenerRutinaPorId = async (userId: string): Promise<RutinaResponse | null> => {
    setLoading(true);
    setSuccess(false);
    setError(false);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_URL}rutinas-ia/${userId}`);

      if (!response.ok) {
        const errorText = await response.text();
        setError(true);
        setErrorMessage(errorText);
        return null;
      }

      const data: RutinaResponse = await response.json();
      setSuccess(true);
      return data;
    } catch {
      setError(true);
      setErrorMessage("No se pudo conectar con el servidor.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generarRutina,
    obtenerRutinaPorId,
    loading,
    success,
    error,
    errorMessage,
    setSuccess,
    setError,
    setErrorMessage,
  };
};

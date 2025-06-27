import { useState } from 'react';
import { API_URL } from '../api/api';

export interface RegistroPayload {
  nombre: string;
  correoElectronico: string;
  contraseña: string;
  fechaNacimiento: string;
  ubicacion: string | null;
}

export const useRegistro = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const registrar = async (payload: RegistroPayload): Promise<string | null> => {
    setLoading(true);
    setSuccess(false);
    setError(false);

    try {
      const response = await fetch(`${API_URL}Usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setError(true);
        return null;
      }

      const data = await response.json();
      setSuccess(true);

      return data._id || data.idUsuario || data.id || null;
    } catch {
      setError(true);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    registrar,
    loading,
    success,
    error,
    setSuccess,
    setError,
  };
};

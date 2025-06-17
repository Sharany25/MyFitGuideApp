import { useState } from 'react';

export interface RegistroPayload {
  nombre: string;
  correoElectronico: string;
  contraseña: string;
  fechaNacimiento: string; // Formato ISO (YYYY-MM-DD)
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
      const response = await fetch('http://192.168.1.11:3000/MyFitGuide/Usuarios', {
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
    } catch (err) {
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

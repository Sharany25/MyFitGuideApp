import { useState } from 'react';
import { API_URL } from '../api/api';


interface ForgotPasswordResponse {
  message: string;
}

interface ForgotPasswordError {
  message: string;
  statusCode?: number;
}

export const useForgotPassword = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);


  const forgotPassword = async (correoElectronico: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${API_URL}usuarios/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correoElectronico }),
      });

      const data: ForgotPasswordResponse | ForgotPasswordError = await response.json();

      if (response.ok) {
        setSuccess(true);

        return true; 
      } else {

        setError(data.message || 'Error al solicitar el restablecimiento de contraseña.');
        return false;
      }
    } catch (err: any) {
      console.error('Error en useForgotPassword:', err);
      setError('No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { forgotPassword, loading, error, success };
};

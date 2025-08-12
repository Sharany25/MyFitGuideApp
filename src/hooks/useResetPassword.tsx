import { useState } from 'react';
import { API_URL } from '../api/api';



interface ResetPasswordResponse {
  message: string;
}

interface ResetPasswordError {
  message: string;
  statusCode?: number;
}

export const useResetPassword = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${API_URL}usuarios/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data: ResetPasswordResponse | ResetPasswordError = await response.json();

      if (response.ok) {
        setSuccess(true);
        return true;
      } else {
        setError(data.message || 'Error al restablecer la contraseña.');
        return false;
      }
    } catch (err: any) {
      console.error('Error en useResetPassword:', err);
      setError('No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { resetPassword, loading, error, success };
};

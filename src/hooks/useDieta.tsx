import { useState } from "react";

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
      const response = await fetch('http://192.168.1.11:3000/MyFitGuide/prueba-dieta', {
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

  return { enviarDieta, loading, error, success };
};

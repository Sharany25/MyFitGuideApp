// src/hooks/useChatbot.tsx
import { useState } from 'react';
import { API_URL } from '../api/api';

interface ChatbotResponse {
  reply: string;
}

export const useChatbot = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (message: string): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}chatbot/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        throw new Error(`Error del servidor: ${res.status}`);
      }

      const data: ChatbotResponse = await res.json();
      return data.reply;
    } catch (err) {
      console.error('Error al comunicar con el chatbot:', err);
      setError('Ocurrió un error al enviar el mensaje.');
      return 'Lo siento, no pude procesar tu mensaje.';
    } finally {
      setLoading(false);
    }
  };

  return {
    sendMessage,
    loading,
    error,
  };
};

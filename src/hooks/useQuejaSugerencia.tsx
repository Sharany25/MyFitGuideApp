import { API_URL } from '../api/api';
import { QuejaSugerenciaDTO } from '../interfaces/quejaSugerencia';

export const enviarQuejaSugerencia = async (data: QuejaSugerenciaDTO) => {
  const response = await fetch(`${API_URL}queja-sugerencia`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Error al enviar la queja o sugerencia');
  }

  return response.json();
};

import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PerfilCompleto {
  usuario?: any;
  dieta?: any;
  rutina?: any;
}

export const useUserPerfil = (userIdParam?: string) => {
  const [loading, setLoading] = useState(true);
  const [perfilCompleto, setPerfilCompleto] = useState<PerfilCompleto>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerfilCompleto = async () => {
      setLoading(true);
      setError(null);

      try {
        let userId: string | undefined = userIdParam;
        if (!userId) {
          const stored = await AsyncStorage.getItem('user');
          if (stored) {
            const user = JSON.parse(stored);
            userId = user._id || user.idUsuario || user.id;
          }
        }
        if (!userId) {
          setPerfilCompleto({});
          setLoading(false);
          setError('No se encontró el usuario');
          return;
        }

        const res = await fetch(`http://192.168.1.11:3000/MyFitGuide/usuario-completo/${userId}`);
        if (res.ok) {
          const json = await res.json();
          setPerfilCompleto(json);
        } else {
          setError('Error al cargar datos');
        }
      } catch {
        setError('Error de conexión');
        setPerfilCompleto({});
      } finally {
        setLoading(false);
      }
    };

    fetchPerfilCompleto();
  }, [userIdParam]);

  return { perfilCompleto, loading, error };
};

import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PerfilCompleto {
  usuario?: any;
  dieta?: any;
  rutina?: any;
}

export const useHomePerfil = (userIdParam?: string) => {
  const [perfilCompleto, setPerfilCompleto] = useState<PerfilCompleto>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string>("");

  const fetchPerfil = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    let id = userIdParam;
    if (!id) {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        id = user._id || user.idUsuario || user.id;
      }
    }
    if (!id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    setUserId(id);

    try {
      const res = await fetch(`http://192.168.1.11:3000/MyFitGuide/usuario-completo/${id}`);
      if (res.ok) {
        setPerfilCompleto(await res.json());
      }
    } catch (e) {}
    setLoading(false);
    setTimeout(() => setRefreshing(false), 600);
  }, [userIdParam]);

  useEffect(() => {
    fetchPerfil();
  }, [fetchPerfil, userIdParam]);

  const onRefresh = async () => {
    fetchPerfil(true);
  };

  return {
    perfilCompleto,
    loading,
    refreshing,
    onRefresh,
    userId,
    setUserId,
    refetch: fetchPerfil,
  };
};

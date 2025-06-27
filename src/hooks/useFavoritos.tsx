import { useState } from "react";
import { API_URL } from "../api/api";

export const useFavoritos = () => {
  const [favoritos, setFavoritos] = useState<{ ejercicios: string[]; comidas: string[] }>({
    ejercicios: [],
    comidas: [],
  });

  const getFavoritos = async (userId: string) => {
    try {
      const res = await fetch(`${API_URL}favoritos/${userId}`);
      const data = await res.json();
      setFavoritos({
        ejercicios: data.ejercicios || [],
        comidas: data.comidas || [],
      });
      return data;
    } catch {
      return { ejercicios: [], comidas: [] };
    }
  };

  const EjerciciosFavoritos = async (userId: string, ejercicio: string, marcar: boolean) => {
    const url = `${API_URL}favoritos/ejercicio`;
    const method = marcar ? "POST" : "DELETE";
    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ejercicio }),
      });
    } catch {}
  };

  const ComidasFavoritas = async (userId: string, comida: string, marcar: boolean) => {
    const url = `${API_URL}favoritos/comida`;
    const method = marcar ? "POST" : "DELETE";
    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, comida }),
      });
    } catch {}
  };

  return { favoritos, getFavoritos, EjerciciosFavoritos, ComidasFavoritas };
};

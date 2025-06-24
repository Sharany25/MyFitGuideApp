import { useState } from "react";

const API_BASE_URL = "http://192.168.1.11:3000/MyFitGuide";

export const useFavoritos = () => {
  const [favoritos, setFavoritos] = useState<{ ejercicios: string[]; comidas: string[] }>({
    ejercicios: [],
    comidas: [],
  });

  // Obtener todos los favoritos (ejercicios y comidas)
  const getFavoritos = async (userId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/favoritos/${userId}`);
      const data = await res.json();
      setFavoritos({
        ejercicios: data.ejercicios || [],
        comidas: data.comidas || [],
      });
      return data; // Devuelve todos los favoritos (ejercicios/comidas)
    } catch (err) {
      console.error("Error al obtener favoritos:", err);
      return { ejercicios: [], comidas: [] };
    }
  };

  // Agregar o eliminar ejercicio favorito
  const EjerciciosFavoritos = async (userId: string, ejercicio: string, marcar: boolean) => {
    const url = `${API_BASE_URL}/favoritos/ejercicio`;
    const method = marcar ? "POST" : "DELETE";
    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ejercicio }), // Solo pasa ejercicio
      });
    } catch (err) {
      console.error("Error al actualizar favorito de ejercicio:", err);
    }
  };

  // Agregar o eliminar comida favorita
  const ComidasFavoritas = async (userId: string, comida: string, marcar: boolean) => {
    const url = `${API_BASE_URL}/favoritos/comida`;
    const method = marcar ? "POST" : "DELETE";
    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, comida }), // Solo pasa comida
      });
    } catch (err) {
      console.error("Error al actualizar favorito de comida:", err);
    }
  };

  return { favoritos, getFavoritos, EjerciciosFavoritos, ComidasFavoritas };
};

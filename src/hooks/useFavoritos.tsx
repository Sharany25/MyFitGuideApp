import { useState } from "react";

const API_BASE_URL = "http://192.168.1.11:3000/MyFitGuide"; // Ajusta si es necesario

export const useFavoritos = () => {
  const [favoritos, setFavoritos] = useState<string[]>([]);

  const getFavoritos = async (userId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/favoritos/${userId}`);
      const data = await res.json();
      setFavoritos(data);
      return data;
    } catch (err) {
      console.error("Error al obtener favoritos:", err);
      return [];
    }
  };

  const toggleFavorito = async (userId: string, ejercicio: string, marcar: boolean) => {
    const url = `${API_BASE_URL}/favoritos`;
    const method = marcar ? "POST" : "DELETE";
    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ejercicio }),
      });
    } catch (err) {
      console.error("Error al actualizar favorito:", err);
    }
  };

  return { favoritos, getFavoritos, toggleFavorito };
};

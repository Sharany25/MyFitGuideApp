// Define la estructura de datos para un Gimnasio
export interface Gym {
  id: number;
  lat: number;
  lon: number;
  name: string;
}

// Define la estructura de datos para un Parque
export interface Park {
  id: number;
  lat: number;
  lon: number;
  name: string;
}

// Función para buscar gimnasios cercanos usando la API de Overpass
export const fetchGymsNearby = async (
  lat: number,
  lon: number,
  radiusM: number = 2000
): Promise<Gym[]> => {
  try {
    const query = `
      [out:json][timeout:25];
      (
        node["leisure"="fitness_centre"](around:${radiusM},${lat},${lon});
        way["leisure"="fitness_centre"](around:${radiusM},${lat},${lon});
        relation["leisure"="fitness_centre"](around:${radiusM},${lat},${lon});
      );
      out center;
    `.trim();

    const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);
    const res = await fetch(url);
    const json = await res.json();

    const gyms: Gym[] = json.elements
      .map((el: any) => {
        const pos = el.type === "node" ? { lat: el.lat, lon: el.lon } : el.center ? { lat: el.center.lat, lon: el.center.lon } : null;
        if (!pos) return null;
        return {
          id: el.id,
          lat: pos.lat,
          lon: pos.lon,
          name: el.tags?.name || "Gimnasio",
        };
      })
      .filter((g: Gym | null): g is Gym => !!g);

    return gyms;
  } catch (e) {
    console.error("Overpass error (Gyms):", e);
    return [];
  }
};

// Función actualizada para buscar solo parques
export const fetchParksNearby = async (
  lat: number,
  lon: number,
  radiusM: number = 2000
): Promise<Park[]> => {
  try {
    const query = `
      [out:json][timeout:25];
      (
        node["leisure"="park"](around:${radiusM},${lat},${lon});
        way["leisure"="park"](around:${radiusM},${lat},${lon});
        relation["leisure"="park"](around:${radiusM},${lat},${lon});
      );
      out center;
    `.trim();

    const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);
    const res = await fetch(url);
    const json = await res.json();

    const parks: Park[] = json.elements
      .map((el: any) => {
        const pos = el.type === "node" ? { lat: el.lat, lon: el.lon } : el.center ? { lat: el.center.lat, lon: el.center.lon } : null;
        if (!pos) return null;
        return {
          id: el.id,
          lat: pos.lat,
          lon: pos.lon,
          name: el.tags?.name || "Parque",
        };
      })
      .filter((p: Park | null): p is Park => !!p);

    return parks;
  } catch (e) {
    console.error("Overpass error (Parks):", e);
    return [];
  }
};

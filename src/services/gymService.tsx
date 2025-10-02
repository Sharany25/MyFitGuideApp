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
  radiusM: number = 100
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

    // *** CORRECCIÓN CRÍTICA DE ROBUSTEZ: Validar respuesta antes de parsear JSON ***
    if (!res.ok) {
        const errorText = await res.text();
        console.error(`Overpass API Error Status ${res.status} (Gyms):`, errorText.substring(0, 200));
        return [];
    }

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
    console.error("Overpass Fetch Error (Gyms):", e);
    return [];
  }
};

// Función para buscar parques cercanos usando la API de Overpass
export const fetchParksNearby = async (
  lat: number,
  lon: number,
  radiusM: number = 100
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

    // *** CORRECCIÓN CRÍTICA DE ROBUSTEZ: Validar respuesta antes de parsear JSON ***
    if (!res.ok) {
        const errorText = await res.text();
        console.error(`Overpass API Error Status ${res.status} (Parks):`, errorText.substring(0, 200));
        return [];
    }

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
    console.error("Overpass Fetch Error (Parks):", e);
    return [];
  }
};

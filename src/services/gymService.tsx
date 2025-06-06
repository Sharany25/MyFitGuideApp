export interface Gym {
    id: number;
    lat: number;
    lon: number;
    name: string;
  }
  
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
  
      const url =
        "https://overpass-api.de/api/interpreter?data=" +
        encodeURIComponent(query);
  
      const res = await fetch(url);
      const json = await res.json();
  
      const gyms: Gym[] = json.elements
        .map((el: any) => {
          const pos = el.type === "node"
            ? { lat: el.lat, lon: el.lon }
            : el.center
            ? { lat: el.center.lat, lon: el.center.lon }
            : null;
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
      console.error("Overpass error:", e);
      return [];
    }
  };
  
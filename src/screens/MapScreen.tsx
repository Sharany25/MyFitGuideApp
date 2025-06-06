import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  Linking,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { fetchGymsNearby, Gym } from "../services/gymService";
import { Ionicons } from "@expo/vector-icons";

const PEXELS_API_KEY = "Y2SubFuD5dpJLdWZLSxS71D9Vr0swU5t2m9h3AQRpYSP91yam0HbjrmJ";

const getGymImageFromPexels = async () => {
  try {
    const response = await fetch(
      "https://api.pexels.com/v1/search?query=gym&per_page=20",
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );
    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.photos.length);
      return data.photos[randomIndex].src.landscape;
    }
    return "https://via.placeholder.com/600x400?text=Sin+Imagen";
  } catch (error) {
    return "https://via.placeholder.com/600x400?text=Sin+Imagen";
  }
};

interface GymWithImage extends Gym {
  image: string;
}

export default function MapScreen() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gyms, setGyms] = useState<GymWithImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGym, setSelectedGym] = useState<GymWithImage | null>(null);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [routeLoading, setRouteLoading] = useState(false);

  // Obtiene ubicación y gimnasios
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      const nearbyGyms = await fetchGymsNearby(
        loc.coords.latitude,
        loc.coords.longitude,
        2000
      );
      const gymsWithImages = await Promise.all(
        nearbyGyms.map(async (gym) => ({
          ...gym,
          image: await getGymImageFromPexels(),
        }))
      );
      setGyms(gymsWithImages);
      setLoading(false);
    })();
  }, []);

  // Cuando seleccionas gym, pide la ruta
  useEffect(() => {
    const getRoute = async () => {
      if (!location || !selectedGym) return;
      setRouteLoading(true);
      try {
        // OpenRouteService API (requiere key)
        const apiKey = "5b3ce3597851110001cf6248149e21a82dda488e80568b769c230794"; // Tu key gratuita (1,000 solicitudes/día)
        const url = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${apiKey}`;
        const body = {
          coordinates: [
            [location.longitude, location.latitude],
            [selectedGym.lon, selectedGym.lat],
          ],
        };
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        const json = await response.json();
        const coords = json.features[0]?.geometry?.coordinates?.map(
          ([lng, lat]: [number, number]) => ({ latitude: lat, longitude: lng })
        );
        setRouteCoords(coords || []);
      } catch (err) {
        setRouteCoords([]);
      }
      setRouteLoading(false);
    };
    if (selectedGym) {
      getRoute();
    } else {
      setRouteCoords([]);
    }
  }, [selectedGym, location]);

  if (loading || !location) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation
      >
        {gyms.map((gym) => (
          <Marker
            key={gym.id}
            coordinate={{ latitude: gym.lat, longitude: gym.lon }}
            onPress={() => setSelectedGym(gym)}
          >
            <Image
              source={require("../../assets/logo2.png")}
              style={styles.markerImg}
              resizeMode="contain"
            />
          </Marker>
        ))}
        {/* Dibuja la ruta */}
        {routeCoords.length > 1 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#007AFF"
            strokeWidth={5}
            lineDashPattern={[1]}
          />
        )}
      </MapView>

      {/* CARD info del gym */}
      {selectedGym && (
        <View style={styles.infoCard}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedGym(null)}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          <Image source={{ uri: selectedGym.image }} style={styles.cardImage} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{selectedGym.name}</Text>
            {/* Botón para navegar en Google Maps */}
            <TouchableOpacity
              style={styles.googleMapsBtn}
              onPress={() => {
                const url = `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${selectedGym.lat},${selectedGym.lon}&travelmode=walking`;
                Linking.openURL(url);
              }}
            >
              <Ionicons name="navigate" size={21} color="#fff" style={{ marginRight: 7 }} />
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Navegar en Google Maps
              </Text>
            </TouchableOpacity>
            {routeLoading ? (
              <ActivityIndicator color="#007AFF" style={{ marginTop: 6 }} />
            ) : null}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  markerImg: {
    width: 45,
    height: 45,
  },
  infoCard: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.21,
    shadowRadius: 5,
    paddingBottom: 8,
  },
  cardImage: {
    width: "100%",
    height: 145,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardContent: {
    padding: 11,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#007AFF",
    textAlign: "center",
  },
  googleMapsBtn: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    elevation: 2,
    shadowColor: "#007AFF",
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
  },
  closeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.13,
    shadowRadius: 1,
  },
  closeButtonText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: -2,
  },
});


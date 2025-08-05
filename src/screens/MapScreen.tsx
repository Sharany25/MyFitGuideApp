import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  Linking,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { fetchGymsNearby, Gym, fetchParksNearby, Park } from "../services/gymService";
import { Ionicons } from "@expo/vector-icons";
import UbicacionAlerta from "../components/UbicacionAlerta";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get('window');

const PALETTE = {
  background_gradient: ['#1D2A32', '#163B48', '#1D2A32'] as const,
  primary: '#2CFD89',
  text_primary: '#FFFFFF',
  text_secondary: '#B0C4DE',
  inactive: 'rgba(255, 255, 255, 0.1)',
  border: 'rgba(255, 255, 255, 0.15)',
  dark: '#1D2A32',
};

const PEXELS_API_KEY = "Y2SubFuD5dpJLdWZLSxS71D9Vr0swU5t2m9h3AQRpYSP91yam0HbjrmJ";

const getGymImageFromPexels = async () => {
  try {
    const response = await fetch("https://api.pexels.com/v1/search?query=gym%20fitness&per_page=20", {
      headers: { Authorization: PEXELS_API_KEY },
    });
    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.photos.length);
      return data.photos[randomIndex].src.landscape;
    }
    return "https://placehold.co/600x400/1D2A32/FFFFFF?text=Gimnasio";
  } catch (error) {
    return "https://placehold.co/600x400/1D2A32/FFFFFF?text=Gimnasio";
  }
};

const getParkImageFromPexels = async () => {
  try {
    const response = await fetch("https://api.pexels.com/v1/search?query=park%20nature&per_page=20", {
      headers: { Authorization: PEXELS_API_KEY },
    });
    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.photos.length);
      return data.photos[randomIndex].src.landscape;
    }
    return "https://placehold.co/600x400/263c3f/FFFFFF?text=Parque";
  } catch (error) {
    return "https://placehold.co/600x400/263c3f/FFFFFF?text=Parque";
  }
};

interface GymWithImage extends Gym {
  image: string;
  type: 'gym';
}
interface ParkWithImage extends Park {
  image: string;
  type: 'park';
}
type MapItem = GymWithImage | ParkWithImage;

export default function MapScreen() {
  const navigation = useNavigation();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gyms, setGyms] = useState<GymWithImage[]>([]);
  const [parks, setParks] = useState<ParkWithImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [showUbicacionAlerta, setShowUbicacionAlerta] = useState(true);
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const cardAnim = useRef(new Animated.Value(300)).current;

  const pedirPermisoUbicacion = async () => {
    setLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLoading(false);
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);

    const [nearbyGyms, nearbyParks] = await Promise.all([
        fetchGymsNearby(loc.coords.latitude, loc.coords.longitude, 2000),
        fetchParksNearby(loc.coords.latitude, loc.coords.longitude, 2000)
    ]);

    const gymsWithImages = await Promise.all(
      nearbyGyms.map(async (gym) => ({ ...gym, image: await getGymImageFromPexels(), type: 'gym' as const }))
    );
    setGyms(gymsWithImages);

    const parksWithImages = await Promise.all(
      nearbyParks.map(async (park) => ({ ...park, image: await getParkImageFromPexels(), type: 'park' as const }))
    );
    setParks(parksWithImages);

    setLoading(false);
  };

  useEffect(() => {
    if (!showUbicacionAlerta) {
      pedirPermisoUbicacion();
    }
  }, [showUbicacionAlerta]);

  useEffect(() => {
    if (selectedItem) {
        Animated.spring(cardAnim, {
            toValue: 0,
            friction: 7,
            useNativeDriver: true,
        }).start();
    } else {
        Animated.timing(cardAnim, {
            toValue: 300,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }
  }, [selectedItem]);

  useEffect(() => {
    const getRoute = async () => {
      if (!location || !selectedItem) return;
      setRouteLoading(true);
      try {
        const apiKey = "5b3ce3597851110001cf6248149e21a82dda488e80568b769c230794";
        const url = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${apiKey}`;
        const body = { coordinates: [[location.longitude, location.latitude], [selectedItem.lon, selectedItem.lat]] };
        const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const json = await response.json();
        const coords = json.features[0]?.geometry?.coordinates?.map(([lng, lat]: [number, number]) => ({ latitude: lat, longitude: lng }));
        setRouteCoords(coords || []);
        if (mapRef.current && coords) {
            mapRef.current.fitToCoordinates(coords, {
                edgePadding: { top: 50, right: 50, bottom: 300, left: 50 },
                animated: true,
            });
        }
      } catch (err) {
        setRouteCoords([]);
      }
      setRouteLoading(false);
    };
    if (selectedItem) getRoute();
    else setRouteCoords([]);
  }, [selectedItem, location]);

  if (loading || !location) {
    return (
      <LinearGradient colors={PALETTE.background_gradient} style={styles.loading}>
        <UbicacionAlerta
          visible={showUbicacionAlerta}
          onClose={() => { setShowUbicacionAlerta(false); setLoading(false); }}
          onConfirm={() => setShowUbicacionAlerta(false)}
        />
        {!showUbicacionAlerta && <ActivityIndicator size="large" color={PALETTE.primary} />}
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, {top: insets.top + 10}]}>
        <Ionicons name="chevron-back" size={28} color={PALETTE.text_primary} />
      </TouchableOpacity>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation
        provider="google"
        customMapStyle={mapStyle}
      >
        {gyms.map((gym) => (
          <Marker key={`gym-${gym.id}`} coordinate={{ latitude: gym.lat, longitude: gym.lon }} onPress={() => setSelectedItem(gym)}>
            <View style={styles.markerContainer}>
                <Image source={require("../../assets/logoMaps.png")} style={styles.markerImg} />
            </View>
          </Marker>
        ))}
        {parks.map((park) => (
          <Marker key={`park-${park.id}`} coordinate={{ latitude: park.lat, longitude: park.lon }} onPress={() => setSelectedItem(park)}>
             <View style={styles.markerContainer}>
                <Image source={require("../../assets/logoMapsPark.png")} style={styles.markerImg} />
            </View>
          </Marker>
        ))}
        {routeCoords.length > 1 && (
          <Polyline coordinates={routeCoords} strokeColor={PALETTE.primary} strokeWidth={5} />
        )}
      </MapView>

      {selectedItem && (
        <Animated.View style={[styles.infoCardContainer, { bottom: insets.bottom > 0 ? insets.bottom + 5 : 95, transform: [{translateY: cardAnim}] }]}>
            <BlurView intensity={50} tint="dark" style={styles.infoCard}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedItem(null)}>
                <Ionicons name="close" size={24} color={PALETTE.text_primary} />
              </TouchableOpacity>
              <Image 
                source={{ uri: selectedItem.image }} 
                style={styles.cardImage} 
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{selectedItem.name}</Text>
                <TouchableOpacity
                  onPress={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${selectedItem.lat},${selectedItem.lon}&travelmode=walking`;
                    Linking.openURL(url);
                  }}
                >
                    <LinearGradient colors={['#2CFD89', '#00A3FF']} style={styles.navigateButton}>
                        {routeLoading ? <ActivityIndicator color={PALETTE.dark} /> : <Text style={styles.navigateButtonText}>Navegar en Google Maps</Text>}
                    </LinearGradient>
                </TouchableOpacity>
              </View>
            </BlurView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  backBtn: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(29, 42, 50, 0.7)',
    borderRadius: 50,
    padding: 8,
  },
  markerContainer: {
    padding: 5,
    borderRadius: 50,
    backgroundColor: 'rgba(29, 42, 50, 0.7)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  markerImg: { 
    width: 40, 
    height: 40,
    borderRadius: 20,
  },
  infoCardContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  infoCard: { 
    borderRadius: 25, 
    overflow: "hidden", 
    borderWidth: 1, 
    borderColor: PALETTE.border 
  },
  cardImage: { width: "100%", height: 150 },
  cardContent: { padding: 20 },
  cardTitle: { fontSize: width * 0.05, fontWeight: "bold", color: PALETTE.text_primary, textAlign: "center", marginBottom: 15 },
  navigateButton: { 
    borderRadius: 15, 
    paddingVertical: 15, 
    alignItems: "center", 
    justifyContent: "center",
    shadowColor: PALETTE.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  navigateButtonText: { color: PALETTE.dark, fontWeight: "bold", fontSize: 16 },
  closeButton: { position: "absolute", top: 10, right: 10, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, width: 32, height: 32, alignItems: "center", justifyContent: "center" },
});

const mapStyle = [ { "elementType": "geometry", "stylers": [ { "color": "#242f3e" } ] }, { "elementType": "labels.text.fill", "stylers": [ { "color": "#746855" } ] }, { "elementType": "labels.text.stroke", "stylers": [ { "color": "#242f3e" } ] }, { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [ { "color": "#263c3f" } ] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [ { "color": "#6b9a76" } ] }, { "featureType": "road", "elementType": "geometry", "stylers": [ { "color": "#38414e" } ] }, { "featureType": "road", "elementType": "geometry.stroke", "stylers": [ { "color": "#212a37" } ] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [ { "color": "#9ca5b3" } ] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [ { "color": "#746855" } ] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [ { "color": "#1f2835" } ] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [ { "color": "#f3d19c" } ] }, { "featureType": "transit", "elementType": "geometry", "stylers": [ { "color": "#2f3948" } ] }, { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "water", "elementType": "geometry", "stylers": [ { "color": "#17263c" } ] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [ { "color": "#515c6d" } ] }, { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [ { "color": "#17263c" } ] } ];

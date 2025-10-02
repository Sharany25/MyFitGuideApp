import React, { useEffect, useState, useRef, useCallback } from "react";
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
import AsyncStorage from '@react-native-async-storage/async-storage';

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
const PLACEHOLDER_GYM = "https://placehold.co/600x400/1D2A32/FFFFFF?text=Gimnasio";
const PLACEHOLDER_PARK = "https://placehold.co/600x400/263c3f/FFFFFF?text=Parque";

const fetchRandomImages = async (query: string, placeholder: string): Promise<string[]> => {
  try {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=20`, {
      headers: { Authorization: PEXELS_API_KEY },
    });
    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      return data.photos.map((photo: any) => photo.src.landscape);
    }
    return [placeholder];
  } catch (error) {
    console.error(`Error al obtener imágenes de ${query}:`, error);
    return [placeholder];
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
  const [showUbicacionAlerta, setShowUbicacionAlerta] = useState(false);
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const cardAnim = useRef(new Animated.Value(300)).current;

  const pedirPermisoUbicacion = useCallback(async () => {
    setLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      setLoading(false);
      return;
    }

    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      
      const [gymImageUrls, parkImageUrls] = await Promise.all([
        fetchRandomImages("gym fitness", PLACEHOLDER_GYM),
        fetchRandomImages("park nature", PLACEHOLDER_PARK),
      ]);

      const [nearbyGyms, nearbyParks] = await Promise.all([
          fetchGymsNearby(loc.coords.latitude, loc.coords.longitude, 2000),
          fetchParksNearby(loc.coords.latitude, loc.coords.longitude, 2000)
      ]);
      
      const getRandomImageUrl = (urls: string[]) => urls[Math.floor(Math.random() * urls.length)];

      const gymsWithImages = nearbyGyms.map((gym) => ({
        ...gym,
        image: getRandomImageUrl(gymImageUrls), 
        type: 'gym' as const
      }));
      setGyms(gymsWithImages);

      const parksWithImages = nearbyParks.map((park) => ({
        ...park,
        image: getRandomImageUrl(parkImageUrls),
        type: 'park' as const
      }));
      setParks(parksWithImages);

      setLocation(loc.coords);

    } catch (error) {
      console.error("Error al obtener la ubicación o datos cercanos:", error);
      setLocation(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAlertStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('@hasSeenLocationAlert');
        if (value === null) {
          setShowUbicacionAlerta(true);
        } else {
          pedirPermisoUbicacion();
        }
      } catch (error) {
        console.error("Error al leer de AsyncStorage:", error);
        setShowUbicacionAlerta(true);
      }
    };
    checkAlertStatus();
  }, [pedirPermisoUbicacion]);

  useEffect(() => {
    if (selectedItem) {
        Animated.spring(cardAnim, {
            toValue: 0,
            friction: 7,
            useNativeDriver: true,
        }).start();
    } else {
        // Reducimos la duración del timing para que la tarjeta desaparezca más rápido
        Animated.timing(cardAnim, {
            toValue: 300,
            duration: 200, 
            useNativeDriver: true,
        }).start();
    }
  }, [selectedItem, cardAnim]);

  const getRoute = useCallback(async () => {
      if (!location || !selectedItem) {
          setRouteCoords([]);
          return;
      } 

      setRouteLoading(true);
      try {
        const apiKey = "5b3ce3597851110001cf6248149e21a82dda488e80568b769c230794";
        const url = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${apiKey}`;
        
        const coordinates = [
            [location.longitude, location.latitude],
            [selectedItem.lon, selectedItem.lat]
        ];
        
        const response = await fetch(url, { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ coordinates }) 
        });
        
        if (!response.ok) {
            console.error("OpenRouteService API error:", response.status);
            setRouteCoords([]);
            return;
        }

        const json = await response.json();
        
        const coords = json.features?.[0]?.geometry?.coordinates?.map(([lng, lat]: [number, number]) => ({ latitude: lat, longitude: lng }));
        
        if (coords && coords.length > 1) {
            setRouteCoords(coords);
            if (mapRef.current) {
                mapRef.current.fitToCoordinates(coords, {
                    edgePadding: { top: 50, right: 50, bottom: 300, left: 50 },
                    animated: true,
                });
            }
        } else {
            setRouteCoords([]);
        }

      } catch (err) {
        console.error("Error al obtener la ruta:", err);
        setRouteCoords([]);
      } finally {
        setRouteLoading(false);
      }
    }, [location, selectedItem]); // Dependencia crítica: location y selectedItem

  useEffect(() => {
    if (selectedItem && location) {
        getRoute();
    } else {
        setRouteCoords([]);
    }
  }, [selectedItem, location, getRoute]); // Ejecutar solo cuando cambian los puntos críticos o getRoute (que depende de ellos)

  const handleCloseAlert = useCallback(async () => {
    setShowUbicacionAlerta(false);
    setLoading(false);
    await AsyncStorage.setItem('@hasSeenLocationAlert', 'true');
  }, []);

  const handleConfirmAlert = useCallback(async () => {
    setShowUbicacionAlerta(false);
    await AsyncStorage.setItem('@hasSeenLocationAlert', 'true');
    pedirPermisoUbicacion();
  }, [pedirPermisoUbicacion]);

  if (showUbicacionAlerta) {
    return (
      <LinearGradient colors={PALETTE.background_gradient} style={styles.loading}>
        <UbicacionAlerta
          visible={showUbicacionAlerta}
          onClose={handleCloseAlert}
          onConfirm={handleConfirmAlert}
        />
      </LinearGradient>
    );
  }

  if (loading || !location) {
    return (
      <LinearGradient colors={PALETTE.background_gradient} style={styles.loading}>
        <ActivityIndicator size="large" color={PALETTE.primary} />
        {!loading && !location && ( 
          <Text style={{ color: PALETTE.text_secondary, marginTop: 20, textAlign: 'center', paddingHorizontal: 30 }}>
            No se pudo obtener la ubicación. Por favor, asegúrate de que los servicios de ubicación estén activados y la app tenga permisos en la configuración de tu dispositivo.
          </Text>
        )}
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
        {[...gyms, ...parks].map((item) => (
          <Marker 
            key={`${item.type}-${item.id}`} 
            coordinate={{ latitude: item.lat, longitude: item.lon }} 
            onPress={() => setSelectedItem(item)}
          >
            <View style={styles.markerContainer}>
                <Image source={item.type === 'gym' ? require("../../assets/logoMaps.png") : require("../../assets/logoMapsPark.png")} style={styles.markerImg} />
            </View>
          </Marker>
        ))}
        {routeCoords.length > 1 && (
          <Polyline 
            coordinates={routeCoords} 
            strokeColor={PALETTE.primary} 
            strokeWidth={5} 
            tappable={false}
            lineJoin="round"
          />
        )}
      </MapView>

      {selectedItem && (
        <Animated.View style={[
          styles.infoCardContainer, 
          { 
            bottom: insets.bottom > 0 ? insets.bottom + 5 : 95,
            transform: [{translateY: cardAnim}] 
          }
        ]}>
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
                    const lat = location?.latitude;
                    const lon = location?.longitude;
                    if (lat && lon) {
                       const url = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lon}&destination=${selectedItem.lat},${selectedItem.lon}&travelmode=walking`; 
                       Linking.openURL(url);
                    }
                  }}
                >
                    <LinearGradient colors={['#2CFD89', '#00A3FF']} style={styles.navigateButton}>
                        {routeLoading ? 
                            <ActivityIndicator color={PALETTE.dark} /> : 
                            <Text style={styles.navigateButtonText}>Navegar en Google Maps</Text>
                        }
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
  cardTitle: { 
    fontSize: width * 0.05, 
    fontWeight: "bold", 
    color: PALETTE.text_primary, 
    textAlign: "center", 
    marginBottom: 15 
  },
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
  navigateButtonText: { 
    color: PALETTE.dark, 
    fontWeight: "bold", 
    fontSize: 16 
  },
  closeButton: { 
    position: "absolute", 
    top: 10, 
    right: 10, 
    zIndex: 10, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    borderRadius: 20, 
    width: 32, 
    height: 32, 
    alignItems: "center", 
    justifyContent: "center" 
  },
});

const mapStyle = [ { "elementType": "geometry", "stylers": [ { "color": "#242f3e" } ] }, { "elementType": "labels.text.fill", "stylers": [ { "color": "#746855" } ] }, { "elementType": "labels.text.stroke", "stylers": [ { "color": "#242f3e" } ] }, { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [ { "color": "#263c3f" } ] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [ { "color": "#6b9a76" } ] }, { "featureType": "road", "elementType": "geometry", "stylers": [ { "color": "#38414e" } ] }, { "featureType": "road", "elementType": "geometry.stroke", "stylers": [ { "color": "#212a37" } ] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [ { "color": "#9ca5b3" } ] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [ { "color": "#746855" } ] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [ { "color": "#1f2835" } ] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [ { "color": "#f3d19c" } ] }, { "featureType": "transit", "elementType": "geometry", "stylers": [ { "color": "#2f3948" } ] }, { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "water", "elementType": "geometry", "stylers": [ { "color": "#17263c" } ] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [ { "color": "#515c6d" } ] }, { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [ { "color": "#17263c" } ] } ];

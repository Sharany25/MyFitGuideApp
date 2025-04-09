import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';

const UbicacionScreen = () => {
  const [location, setLocation] = useState<Geolocation.GeoPosition | null>(null);
  const [gimnasios, setGimnasios] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerUbicacion = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Permiso de ubicación',
          message: 'Esta aplicación necesita acceder a tu ubicación para mostrar gimnasios cercanos.',
          buttonNegative: 'Cancelar',
          buttonPositive: 'Aceptar',
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setError('Permiso de ubicación denegado');
        return;
      }
    }

    Geolocation.getCurrentPosition(
      position => {
        setLocation(position);
        buscarGimnasiosCercanos(position.coords.latitude, position.coords.longitude);
      },
      error => {
        setError('No se pudo obtener la ubicación');
        console.log(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const buscarGimnasiosCercanos = async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const API_KEY = 'TU_CLAVE_API_GOOGLE';  // Reemplaza con tu clave API de Google
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=gym&key=${API_KEY}`;
      const response = await axios.get(url);
      setGimnasios(response.data.results);
    } catch (error) {
      setError('Error al cargar los gimnasios');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerUbicacion();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gimnasios Cercanos</Text>

      {loading && <ActivityIndicator size="large" color="#00f" />}
      {error && <Text style={styles.error}>{error}</Text>}

      {location && !loading && (
        <MapView
          style={styles.map}
          region={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Tu ubicación"
            description="Estás aquí"
          />
          {gimnasios.map((gimnasio, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: gimnasio.geometry.location.lat,
                longitude: gimnasio.geometry.location.lng,
              }}
              title={gimnasio.name}
              description={gimnasio.vicinity}
            />
          ))}
        </MapView>
      )}

      {!location && !loading && !error && (
        <TouchableOpacity style={styles.button} onPress={obtenerUbicacion}>
          <Text style={styles.buttonText}>Obtener Ubicación</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  map: {
    width: '100%',
    height: '70%',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontSize: 16,
    marginTop: 20,
  },
});

export default UbicacionScreen;

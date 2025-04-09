import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import { Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Asegúrate de que el nombre de la importación sea correcto

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen 
        name="Rutinas" 
        component={() => <Text>Rutinas</Text>} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="fitness-outline" size={size} color={color} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Tienda" 
        component={() => <Text>Tienda</Text>} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Inicio" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Ubicaciones"  
        component={() => <Text>Ubicaciones</Text>} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location-outline" size={size} color={color} /> // Cambiado a icono de ubicación
          ),
        }} 
      />
      <Tab.Screen 
        name="Perfil" 
        component={() => <Text>Perfil</Text>} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }} 
      />
    </Tab.Navigator>
  );
}
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, FlatList, Image
} from 'react-native';

const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const routinesMale: Record<string, any> = {
  Lun: {
    title: 'Push',
    category: 'Pecho, Hombros, Tríceps',
    duration: '45-60 min',
    image: 'https://example.com/push.jpg',
    exercises: [
      { name: 'Press de banca', sets: '4 series • 8-10 reps' },
      { name: 'Press militar', sets: '4 series • 10 reps' },
      { name: 'Fondos', sets: '3 series • 12 reps' },
    ],
  },
  Mar: {
    title: 'Pull',
    category: 'Espalda y Bíceps',
    duration: '45-60 min',
    image: 'https://example.com/pull.jpg',
    exercises: [
      { name: 'Dominadas', sets: '4 series • 10 reps' },
      { name: 'Remo con barra', sets: '4 series • 12 reps' },
      { name: 'Curl bíceps', sets: '3 series • 15 reps' },
    ],
  },
  // Agrega Mié, Jue, etc.
};

const routinesFemale: Record<string, any> = {
  Lun: {
    title: 'Piernas',
    category: 'Glúteos, Cuádriceps',
    duration: '50-60 min',
    image: 'https://example.com/legs.jpg',
    exercises: [
      { name: 'Hip thrust', sets: '4x12' },
      { name: 'Sentadillas', sets: '4x10' },
      { name: 'Abductores', sets: '3x15' },
    ],
  },
  Mar: {
    title: 'Glúteos y Core',
    category: 'Glúteos + Abdomen',
    duration: '40-50 min',
    image: 'https://example.com/core.jpg',
    exercises: [
      { name: 'Plancha', sets: '3x1 min' },
      { name: 'Elevaciones de piernas', sets: '4x15' },
      { name: 'Patadas de glúteo', sets: '3x20' },
    ],
  },
  // Agrega Mié, Jue, etc.
};

export const RutinasScreen: React.FC = () => {
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [selectedDay, setSelectedDay] = useState('Lun');

  const routines = gender === 'male' ? routinesMale : routinesFemale;
  const routine = routines[selectedDay];

  if (!gender) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 24 }}>Selecciona tu género</Text>
        <View style={{ flexDirection: 'row', gap: 20 }}>
          <TouchableOpacity
            style={{ backgroundColor: '#4285F4', padding: 16, borderRadius: 12 }}
            onPress={() => setGender('male')}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Hombre</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: '#EA4C89', padding: 16, borderRadius: 12 }}
            onPress={() => setGender('female')}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Mujer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{ paddingTop: 50, paddingHorizontal: 16, backgroundColor: '#00C48C', paddingBottom: 20 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Rutinas de Entrenamiento</Text>
        <FlatList
          data={days}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ marginTop: 12 }}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedDay(item)}
              style={{
                backgroundColor: item === selectedDay ? '#fff' : '#00A676',
                paddingVertical: 6,
                paddingHorizontal: 14,
                borderRadius: 20,
                marginRight: 10,
              }}>
              <Text style={{ color: item === selectedDay ? '#00A676' : '#fff', fontWeight: 'bold' }}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Rutina del día */}
      {routine && (
        <View style={{ padding: 16 }}>
          <View style={{ backgroundColor: '#f5f5f5', borderRadius: 12, overflow: 'hidden' }}>
            <Image
              source={{ uri: routine.image }}
              style={{ width: '100%', height: 180 }}
              resizeMode="cover"
            />
            <View style={{ padding: 12 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{selectedDay} - {routine.title}</Text>
              <Text style={{ color: '#777', marginBottom: 4 }}>{routine.category}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#999' }}>{routine.duration}</Text>
                <TouchableOpacity style={{ backgroundColor: '#00C48C', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Comenzar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Ejercicios */}
          <View style={{ marginTop: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Ejercicios</Text>
            {routine.exercises.map((exercise: any, index: number) => (
              <View key={index} style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}>
                <Text style={{ fontSize: 16, fontWeight: '500' }}>{exercise.name}</Text>
                <Text style={{ color: '#666', marginTop: 4 }}>{exercise.sets}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

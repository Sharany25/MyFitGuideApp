import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  day: string;
  title: string;
  exercises: string[];
}

export const RoutineCard: React.FC<Props> = ({ day, title, exercises }) => (
  <View style={{ marginBottom: 16, padding: 16, backgroundColor: '#fff', borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6 }}>
    <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{day} - {title}</Text>
    {exercises.map((ex, i) => (
      <Text key={i} style={{ marginTop: 4 }}>• {ex}</Text>
    ))}
  </View>
);

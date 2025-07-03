// CardInput.tsx
import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

type CardInputProps = {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  maxLength?: number;
  secureTextEntry?: boolean;
};

const CardInput: React.FC<CardInputProps> = ({
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  maxLength,
  secureTextEntry = false,
}) => (
  <View style={styles.inputContainer}>
    {icon}
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#A0A0A0"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      maxLength={maxLength}
      secureTextEntry={secureTextEntry}
      autoCapitalize="words"
      autoCorrect={false}
    />
  </View>
);

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18,
    elevation: 4,
    shadowColor: '#0002',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#333',
    marginLeft: 10,
    letterSpacing: 1,
  },
});

export default CardInput;

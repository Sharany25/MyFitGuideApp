import React from 'react';
import { Text, StyleSheet } from 'react-native';

// Este componente recibirá un mensaje de error y lo mostrará en pantalla.
type ErrorMessageProps = {
  message: string;
};

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return <Text style={styles.errorText}>{message}</Text>;
};

const styles = StyleSheet.create({
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
});

export default ErrorMessage;

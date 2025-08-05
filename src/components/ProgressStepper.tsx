import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const PALETTE = {
  primary: '#2CFD89',
  text_primary: '#FFFFFF',
  text_secondary: '#B0C4DE',
  inactive: 'rgba(255, 255, 255, 0.2)',
};

type Step = 'Registro' | 'Dieta' | 'Rutina';

interface ProgressStepperProps {
  currentStep: Step;
}

const steps: { key: Step; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { key: 'Registro', label: 'Perfil', icon: 'account' },
  { key: 'Dieta', label: 'Dieta', icon: 'silverware-fork-knife' },
  { key: 'Rutina', label: 'Rutina', icon: 'dumbbell' },
];

const ProgressStepper: React.FC<ProgressStepperProps> = ({ currentStep }) => {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {steps.map((step, index) => {
          const isActive = index <= currentIndex;
          const iconColor = isActive ? PALETTE.primary : PALETTE.text_secondary;
          const labelStyle = isActive ? styles.labelActive : styles.labelInactive;

          return (
            <View key={step.key} style={styles.stepItem}>
              <MaterialCommunityIcons
                name={step.icon}
                size={width * 0.07}
                color={iconColor}
              />
              <Text style={labelStyle}>{step.label}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBar,
            { width: `${((currentIndex + 0.5) / steps.length) * 100}%` },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 10,
    marginVertical: 15,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stepItem: {
    alignItems: 'center',
  },
  labelActive: {
    marginTop: 6,
    color: PALETTE.primary,
    fontWeight: 'bold',
    fontSize: width * 0.035,
  },
  labelInactive: {
    marginTop: 6,
    color: PALETTE.text_secondary,
    fontSize: width * 0.035,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: PALETTE.inactive,
    borderRadius: 2,
    marginTop: 10,
    marginHorizontal: width * 0.05,
  },
  progressBar: {
    height: '100%',
    backgroundColor: PALETTE.primary,
    borderRadius: 2,
  },
});

export default ProgressStepper;

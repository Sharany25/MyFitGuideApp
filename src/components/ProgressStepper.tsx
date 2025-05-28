import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type Step = 'Registro' | 'Dieta' | 'Rutina';

interface ProgressStepperProps {
  currentStep: Step;
}

const steps: { key: Step; label: string; icon: keyof typeof icons }[] = [
  { key: 'Registro', label: 'Perfil', icon: 'account' },
  { key: 'Dieta', label: 'Dieta', icon: 'silverware-fork-knife' },
  { key: 'Rutina', label: 'Rutina', icon: 'dumbbell' },
];

const icons = {
  account: 'account',
  'silverware-fork-knife': 'silverware-fork-knife',
  dumbbell: 'dumbbell',
};

const ProgressStepper: React.FC<ProgressStepperProps> = ({ currentStep }) => {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.progressBar, { width: `${((currentIndex + 1) / steps.length) * 100}%` }]} />

      <View style={styles.container}>
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          const iconColor = isCompleted
            ? '#00C27F'
            : isCurrent
            ? '#000'
            : '#bbb';

          const textStyle = isCompleted
            ? styles.labelCompleted
            : isCurrent
            ? styles.labelCurrent
            : styles.labelInactive;

          return (
            <View key={step.key} style={styles.stepItem}>
              <MaterialCommunityIcons
                name={icons[step.icon]}
                size={22}
                color={iconColor}
              />
              <Text style={textStyle}>
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 8,
    paddingBottom: 10,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 4,
    backgroundColor: '#00C27F',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  labelCompleted: {
    marginTop: 4,
    color: '#00C27F',
    fontWeight: '600',
    fontSize: 12,
  },
  labelCurrent: {
    marginTop: 4,
    color: '#000',
    fontWeight: '600',
    fontSize: 12,
  },
  labelInactive: {
    marginTop: 4,
    color: '#bbb',
    fontSize: 12,
  },
});

export default ProgressStepper;

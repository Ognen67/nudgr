import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconSymbol } from './IconSymbol';

export function IconDemo() {
  return (
    <View style={styles.container}>
      {/* Input Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Input Icons</Text>
        <View style={styles.iconRow}>
          <View style={styles.iconContainer}>
            <IconSymbol name="input-textbox" size={32} weight="duotone" />
            <Text style={styles.iconLabel}>Text Input</Text>
          </View>
          <View style={styles.iconContainer}>
            <IconSymbol name="input-form" size={32} weight="duotone" />
            <Text style={styles.iconLabel}>Form</Text>
          </View>
          <View style={styles.iconContainer}>
            <IconSymbol name="input-clipboard" size={32} weight="duotone" />
            <Text style={styles.iconLabel}>Clipboard</Text>
          </View>
        </View>
      </View>

      {/* Reflect Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reflect Icons</Text>
        <View style={styles.iconRow}>
          <View style={styles.iconContainer}>
            <IconSymbol name="reflect-brain" size={32} weight="duotone" />
            <Text style={styles.iconLabel}>Brain</Text>
          </View>
          <View style={styles.iconContainer}>
            <IconSymbol name="reflect-lightbulb" size={32} weight="duotone" />
            <Text style={styles.iconLabel}>Lightbulb</Text>
          </View>
          <View style={styles.iconContainer}>
            <IconSymbol name="reflect-sparkle" size={32} weight="duotone" />
            <Text style={styles.iconLabel}>Sparkle</Text>
          </View>
        </View>
      </View>

      {/* Timeline Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Timeline Icons</Text>
        <View style={styles.iconRow}>
          <View style={styles.iconContainer}>
            <IconSymbol name="timeline-chart" size={32} weight="duotone" />
            <Text style={styles.iconLabel}>Chart</Text>
          </View>
          <View style={styles.iconContainer}>
            <IconSymbol name="timeline-hourglass" size={32} weight="duotone" />
            <Text style={styles.iconLabel}>Hourglass</Text>
          </View>
          <View style={styles.iconContainer}>
            <IconSymbol name="timeline-calendar" size={32} weight="duotone" />
            <Text style={styles.iconLabel}>Calendar</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
  },
  iconLabel: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
}); 
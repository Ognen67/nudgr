import React from 'react';
import {
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassTabBarProps {
  children: React.ReactNode;
}

export const GlassTabBar: React.FC<GlassTabBarProps> = ({ children }) => {
  return (
    <View style={styles.container}>
      <BlurView 
        intensity={200}
        tint="dark"
        style={styles.blur}
      >
        <View style={styles.overlay}>
          {children}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 88 : 70,
    overflow: 'hidden',
  },
  blur: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
}); 
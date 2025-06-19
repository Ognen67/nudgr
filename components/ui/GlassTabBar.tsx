import React from 'react';
import {
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassTabBarProps {
  children: React.ReactNode;
}

export const GlassTabBar: React.FC<GlassTabBarProps> = ({ children }) => {
  return (
    <View style={styles.container}>
      <BlurView 
        intensity={Platform.OS === 'ios' ? 100 : 150}
        tint="systemUltraThinMaterialDark"
        style={styles.blur}
      >
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.1)',
            'rgba(255, 255, 255, 0.05)',
            'rgba(0, 0, 0, 0.1)'
          ]}
          locations={[0, 0.5, 1]}
          style={styles.gradient}
        >
          <View style={styles.overlay}>
            {children}
          </View>
        </LinearGradient>
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
  },
  gradient: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    // Glass effect shadow
    shadowColor: 'rgba(255, 255, 255, 0.3)',
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
}); 
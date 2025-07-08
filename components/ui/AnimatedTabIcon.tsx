import { Ionicons } from '@expo/vector-icons';
import React, { memo, useEffect, useRef } from 'react';
import { Animated } from 'react-native';

// Types
type IoniconsName = keyof typeof Ionicons.glyphMap;
type PhosphorIconComponent = React.ComponentType<{ size?: number; color?: string; weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone' }>;

interface AnimatedTabIconProps {
  name?: IoniconsName;
  PhosphorIcon?: PhosphorIconComponent;
  focused: boolean;
  color: string;
}

// Constants
const ANIMATION_CONFIG = {
  spring: {
    tension: 150,
    friction: 8,
    useNativeDriver: true,
  },
  timing: {
    duration: 200,
    useNativeDriver: true,
  },
} as const;

const SCALE_VALUES = {
  focused: 1.2,
  unfocused: 1,
} as const;

const OPACITY_VALUES = {
  focused: 1,
  unfocused: 0.7,
} as const;

// Memoized Animated Tab Icon Component
export const AnimatedTabIcon = memo<AnimatedTabIconProps>(({ name, PhosphorIcon, focused, color }) => {
  const scaleValue = useRef(new Animated.Value(focused ? SCALE_VALUES.focused : SCALE_VALUES.unfocused)).current;
  const opacityValue = useRef(new Animated.Value(focused ? OPACITY_VALUES.focused : OPACITY_VALUES.unfocused)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: focused ? SCALE_VALUES.focused : SCALE_VALUES.unfocused,
        ...ANIMATION_CONFIG.spring,
      }),
      Animated.timing(opacityValue, {
        toValue: focused ? OPACITY_VALUES.focused : OPACITY_VALUES.unfocused,
        ...ANIMATION_CONFIG.timing,
      }),
    ]).start();
  }, [focused, scaleValue, opacityValue]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleValue }],
        opacity: opacityValue,
      }}
    >
      {PhosphorIcon ? (
        <PhosphorIcon 
          size={24} 
          color={color} 
          weight={focused ? 'fill' : 'regular'} 
        />
      ) : name ? (
        <Ionicons name={name} size={24} color={color} />
      ) : null}
    </Animated.View>
  );
});
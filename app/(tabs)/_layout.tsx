import { Tabs } from 'expo-router';
import React, { memo, useRef, useEffect } from 'react';
import { Platform, View, Animated } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { Ionicons } from '@expo/vector-icons';
import { GlassTabBar } from '@/components/ui/GlassTabBar';

// Types
type IoniconsName = keyof typeof Ionicons.glyphMap;

interface AnimatedTabIconProps {
  name: IoniconsName;
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
const AnimatedTabIcon = memo<AnimatedTabIconProps>(({ name, focused, color }) => {
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
      <Ionicons name={name} size={24} color={color} />
    </Animated.View>
  );
});

// Tab bar configuration
const TAB_BAR_CONFIG = {
  activeTintColor: '#FF6B35',
  inactiveTintColor: 'rgba(255, 255, 255, 0.6)',
  height: {
    ios: 88,
    default: 70,
  },
  padding: {
    bottom: {
      ios: 34,
      default: 16,
    },
    top: 12,
    vertical: 4,
  },
} as const;

const tabBarStyle = {
  position: 'absolute' as const,
  bottom: 0,
  left: 0,
  right: 0,
  height: Platform.OS === 'ios' ? TAB_BAR_CONFIG.height.ios : TAB_BAR_CONFIG.height.default,
  backgroundColor: 'transparent',
  borderTopWidth: 0,
  paddingBottom: Platform.OS === 'ios' ? TAB_BAR_CONFIG.padding.bottom.ios : TAB_BAR_CONFIG.padding.bottom.default,
  paddingTop: TAB_BAR_CONFIG.padding.top,
  elevation: 0,
  shadowOpacity: 0,
  borderTopColor: 'transparent',
};

const tabBarLabelStyle = {
  fontFamily: 'Inter',
  fontSize: 11,
  fontWeight: '600' as const,
  marginTop: 4,
  letterSpacing: 0.3,
};

const tabBarItemStyle = {
  paddingVertical: TAB_BAR_CONFIG.padding.vertical,
};

// Tab bar background component
const renderTabBarBackground = () => (
  <GlassTabBar>
    <View />
  </GlassTabBar>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: TAB_BAR_CONFIG.activeTintColor,
        tabBarInactiveTintColor: TAB_BAR_CONFIG.inactiveTintColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: renderTabBarBackground,
        tabBarStyle,
        tabBarLabelStyle,
        tabBarItemStyle,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon 
              name={focused ? 'home' : 'home-outline'} 
              focused={focused} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon 
              name={focused ? 'rocket' : 'rocket-outline'} 
              focused={focused} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-assistant"
        options={{
          title: 'AI Coach',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon 
              name={focused ? 'sparkles' : 'sparkles-outline'} 
              focused={focused} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null, // Hidden from tab bar
        }}
      />
    </Tabs>
  );
}

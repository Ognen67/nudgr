import { Tabs } from 'expo-router';
import React from 'react';
import { 
  Platform, 
  View, 
  Animated
} from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { GlassTabBar } from '@/components/ui/GlassTabBar';

// Animated Tab Icon Component
const AnimatedTabIcon = ({ name, focused, color }: { name: string, focused: boolean, color: string }) => {
  const scaleValue = new Animated.Value(focused ? 1.2 : 1);
  const opacityValue = new Animated.Value(focused ? 1 : 0.7);

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: focused ? 1.2 : 1,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
      Animated.timing(opacityValue, {
        toValue: focused ? 1 : 0.7,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleValue }],
        opacity: opacityValue,
      }}
    >
      <Ionicons name={name as any} size={24} color={color} />
    </Animated.View>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => <GlassTabBar><View /></GlassTabBar>,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === 'ios' ? 88 : 70,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          paddingBottom: Platform.OS === 'ios' ? 34 : 16,
          paddingTop: 12,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter',
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          letterSpacing: 0.3,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
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
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon 
              name={focused ? 'checkmark-circle' : 'checkmark-circle-outline'} 
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
              name={focused ? 'flag' : 'flag-outline'} 
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
          href: null, // This hides the tab from the tab bar
        }}
      />
    </Tabs>
  );
}

import React, { useRef } from 'react';
import { StyleSheet, Animated, View, Platform, Text, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { TextboxIcon, LightbulbIcon, Hourglass, Brain } from 'phosphor-react-native';
import { GlassTabBar } from './GlassTabBar';

interface ToggleableTabBarProps {
  isVisible: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}

interface TabButtonProps {
  icon: React.ComponentType<any>;
  label: string;
  route: string;
  isActive?: boolean;
  onPress: (route: string) => void;
}

// Tab configuration matching the main layout EXACTLY
const TAB_CONFIG = [
  { icon: TextboxIcon, label: 'input', route: '' },
  { icon: LightbulbIcon, label: 'reflect', route: 'goals' },
  { icon: Hourglass, label: 'timeline', route: 'ai-assistant' },
  { icon: Brain, label: 'mind map', route: 'ideas-3d' },
];

const TabButton: React.FC<TabButtonProps> = ({ icon: Icon, label, route, isActive, onPress }) => (
  <TouchableOpacity
    style={styles.tabButton}
    onPress={() => onPress(route)}
    activeOpacity={0.7}
  >
    <Icon 
      size={24} 
      color={isActive ? '#FF6B35' : 'rgba(255, 255, 255, 0.6)'} 
      weight={isActive ? 'fill' : 'regular'} 
    />
    <Text style={[
      styles.tabLabel, 
      { color: isActive ? '#FF6B35' : 'rgba(255, 255, 255, 0.6)' }
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export const ToggleableTabBar: React.FC<ToggleableTabBarProps> = ({ isVisible, onToggle, onNavigate }) => {
  const menuOpacity = useRef(new Animated.Value(0)).current;
  const menuTranslateY = useRef(new Animated.Value(100)).current;
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(menuOpacity, {
        toValue: isVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(menuTranslateY, {
        toValue: isVisible ? 0 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isVisible]);

  const navigateToTab = (tabRoute: string) => {
    // Start smooth transition to normal tab bar position (translateY: 0)
    Animated.parallel([
      Animated.timing(menuOpacity, {
        toValue: 1, // Keep visible during transition
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(menuTranslateY, {
        toValue: 0, // Move to normal tab bar position
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // After smooth transition, navigate
      if (onNavigate) {
        onNavigate();
      }
      
      if (tabRoute === '') {
        router.push('/');
      } else {
        router.push(`/${tabRoute}` as any);
      }
    });
  };

  const getCurrentRoute = () => {
    if (pathname === '/') return '';
    return pathname.replace('/', '');
  };

  return (
    <Animated.View 
      style={[
        styles.tabBarOverlay,
        {
          opacity: menuOpacity,
          transform: [{ translateY: menuTranslateY }],
        }
      ]}
      pointerEvents={isVisible ? 'auto' : 'none'}
    >
      <GlassTabBar>
        <View style={styles.tabBarContent}>
          {TAB_CONFIG.map((tab) => (
            <TabButton
              key={tab.route || 'index'}
              icon={tab.icon}
              label={tab.label}
              route={tab.route}
              isActive={getCurrentRoute() === tab.route}
              onPress={navigateToTab}
            />
          ))}
        </View>
      </GlassTabBar>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tabBarOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 88 : 70,
    zIndex: 1000,
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.3,
    fontFamily: 'Inter',
  },
}); 
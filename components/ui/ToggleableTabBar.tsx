import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import { Brain, Hourglass, LightbulbIcon, TextboxIcon } from 'phosphor-react-native';
import React, { useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AnimatedTabIcon } from './AnimatedTabIcon';
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

// Tab bar configuration - matching main layout
const TAB_BAR_CONFIG = {
  activeTintColor: '#FF6B35',
  inactiveTintColor: 'rgba(255, 255, 255, 0.6)',
} as const;

// Enhanced Tab Button with AnimatedTabIcon
const TabButton: React.FC<TabButtonProps> = ({ icon: Icon, label, route, isActive, onPress }) => {
  const handlePress = () => {
    // Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(route);
  };

  const color = isActive ? TAB_BAR_CONFIG.activeTintColor : TAB_BAR_CONFIG.inactiveTintColor;

  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <AnimatedTabIcon 
        PhosphorIcon={Icon}
        focused={isActive || false}
        color={color}
      />
      <Text style={[
        styles.tabLabel, 
        { color }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

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
    // Don't hide menu when navigating - let the user control when to hide it
    if (tabRoute === '') {
      router.push('/');
    } else {
      router.push(`/${tabRoute}` as any);
    }
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
    // Match GlassTabBar height exactly
    height: Platform.OS === 'ios' ? 88 : 70,
    overflow: 'hidden',
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    // Match the regular tab bar padding exactly - platform specific
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    // Match the regular tab bar item padding
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.3,
    fontFamily: 'Inter',
  },
}); 
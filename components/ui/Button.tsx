import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  disabled = false,
  style,
}) => {
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.button, styles[size]];
    
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primary);
        break;
      case 'secondary':
        baseStyle.push(styles.secondary);
        break;
      case 'danger':
        baseStyle.push(styles.danger);
        break;
    }
    
    if (disabled) {
      baseStyle.push(styles.disabled);
    }
    
    return baseStyle;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyle: TextStyle[] = [styles.text];
    
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallText);
        break;
      case 'medium':
        baseStyle.push(styles.mediumText);
        break;
      case 'large':
        baseStyle.push(styles.largeText);
        break;
    }
    
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryText);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryText);
        break;
      case 'danger':
        baseStyle.push(styles.dangerText);
        break;
    }
    
    return baseStyle;
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={[getButtonStyle(), style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
      >
        {icon && (
          <Ionicons 
            name={icon as any} 
            size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
            color={variant === 'primary' ? '#000000' : '#FF6B35'} 
            style={styles.icon}
          />
        )}
        <Text style={getTextStyle()}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface NeonNumberProps {
  value: string | number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export const NeonNumber: React.FC<NeonNumberProps> = ({
  value,
  size = 'medium',
  color = '#FF6B35',
}) => {
  return (
    <Text style={[
      styles.neonNumber,
      styles[`neon${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles],
      { 
        color,
        textShadowColor: color,
        shadowColor: color,
      }
    ]}>
      {value}
    </Text>
  );
};

interface NeonTextProps {
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  color?: string;
  intensity?: 'low' | 'medium' | 'high';
  style?: TextStyle;
}

export const NeonText: React.FC<NeonTextProps> = ({
  children,
  size = 'medium',
  color = '#FFFFFF',
  intensity = 'medium',
  style,
}) => {
  const getNeonStyle = () => {
    const baseStyle = [styles.neonText, styles[`neonText${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles]];
    
    let shadowRadius = 8;
    let shadowOpacity = 0.8;
    let elevation = 5;
    
    switch (intensity) {
      case 'low':
        shadowRadius = 4;
        shadowOpacity = 0.4;
        elevation = 3;
        break;
      case 'medium':
        shadowRadius = 8;
        shadowOpacity = 0.8;
        elevation = 5;
        break;
      case 'high':
        shadowRadius = 15;
        shadowOpacity = 1;
        elevation = 8;
        break;
    }
    
    return [
      ...baseStyle,
      {
        color,
        textShadowColor: color,
        textShadowRadius: shadowRadius,
        shadowColor: color,
        shadowOpacity,
        elevation,
      },
      style,
    ];
  };

  return (
    <Text style={getNeonStyle()}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  small: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  medium: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  large: {
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  primary: {
    backgroundColor: '#FF6B35',
  },
  secondary: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },
  danger: {
    backgroundColor: '#FF4444',
  },
  disabled: {
    backgroundColor: '#666666',
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    fontFamily: 'Inter',
    letterSpacing: -0.3,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  primaryText: {
    color: '#000000',
  },
  secondaryText: {
    color: '#FF6B35',
  },
  dangerText: {
    color: '#FFFFFF',
  },
  icon: {
    marginRight: 8,
  },
  neonNumber: {
    fontWeight: '900',
    fontFamily: 'Inter',
    textShadowRadius: 15,
    textShadowOffset: { width: 0, height: 0 },
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  neonSmall: {
    fontSize: 20,
  },
  neonMedium: {
    fontSize: 28,
  },
  neonLarge: {
    fontSize: 36,
  },
  neonText: {
    fontFamily: 'Inter',
    textShadowOffset: { width: 0, height: 0 },
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
  },
  neonTextSmall: {
    fontSize: 14,
    fontWeight: '500',
  },
  neonTextMedium: {
    fontSize: 16,
    fontWeight: '600',
  },
  neonTextLarge: {
    fontSize: 20,
    fontWeight: '700',
  },
  neonTextXlarge: {
    fontSize: 28,
    fontWeight: '800',
  },
}); 
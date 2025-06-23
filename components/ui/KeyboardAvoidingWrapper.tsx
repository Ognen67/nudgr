import React from 'react';
import {
  View,
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ViewStyle,
} from 'react-native';

interface KeyboardAvoidingWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  innerStyle?: ViewStyle;
  behavior?: 'height' | 'position' | 'padding';
  enableAutomaticScroll?: boolean;
}

const KeyboardAvoidingWrapper: React.FC<KeyboardAvoidingWrapperProps> = ({
  children,
  style,
  innerStyle,
  behavior,
  enableAutomaticScroll = true,
}) => {
  const keyboardBehavior = behavior || (Platform.OS === 'ios' ? 'padding' : 'height');

  return (
    <KeyboardAvoidingView
      behavior={keyboardBehavior}
      style={[styles.container, style]}
      enabled={enableAutomaticScroll}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.inner, innerStyle]}>
          {children}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: 24,
  },
});

export default KeyboardAvoidingWrapper; 
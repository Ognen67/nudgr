import { ENDPOINTS } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Platform,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import KeyboardAvoidingWrapper from './KeyboardAvoidingWrapper';

interface AppLayoutProps {
  children: React.ReactNode;
  showChatbox?: boolean;
}

// Enhanced Glass Chat Component
const GlassChat: React.FC<{
  chatMessage: string;
  setChatMessage: (message: string) => void;
  onSendMessage: () => void;
  loading?: boolean;
}> = ({
  chatMessage,
  setChatMessage,
  onSendMessage,
  loading = false
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const translateY = useRef(new Animated.Value(0)).current;
    const borderRadius = useRef(new Animated.Value(0)).current;
    const marginHorizontal = useRef(new Animated.Value(0)).current;
    const glowOpacity = useRef(new Animated.Value(0)).current;

    const handleFocus = () => {
      setIsFocused(true);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: false,
          tension: 50,
          friction: 20,
          delay: 0
        }),
        Animated.spring(borderRadius, {
          toValue: 20,
          useNativeDriver: false,
          tension: 50,
          friction: 20,
          delay: 0
        }),
        Animated.spring(marginHorizontal, {
          toValue: 24,
          useNativeDriver: false,
          tension: 50,
          friction: 10,
          delay: 0
        }),
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 350,
          delay: 0,
          useNativeDriver: false
        })
      ]).start();
    };

    const handleBlur = () => {
      setIsFocused(false);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: false,
          tension: 50,
          friction: 20
        }),
        Animated.spring(borderRadius, {
          toValue: 0,
          useNativeDriver: false,
          tension: 50,
          friction: 20
        }),
        Animated.spring(marginHorizontal, {
          toValue: 0,
          useNativeDriver: false,
          tension: 50,
          friction: 20
        }),
        Animated.timing(glowOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false
        })
      ]).start();
    };

    return (
      <Animated.View
        style={[
          styles.chatContainer,
          {
            transform: [{ translateY }],
            marginHorizontal,
            backgroundColor: 'transparent',
          }
        ]}
      >
        {/* Glowy border */}
        <Animated.View
          pointerEvents="none"
          style={[
            { ...StyleSheet.absoluteFillObject },
            {
              opacity: glowOpacity,
              borderRadius,
              borderWidth: 2,
              borderColor: 'rgba(255,107,53,0.7)',
              shadowColor: '#FF6B35',
              shadowOpacity: 0.7,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 0 },
              zIndex: 2,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.chatBlur,
            {
              borderRadius,
              overflow: 'hidden',
            }
          ]}
        >
          <BlurView
            intensity={60}
            tint="dark"
            style={styles.blurViewStyle}
          >
            <View style={styles.chatOverlay}>
              <View style={styles.chatContent}>
                <View style={styles.chatInputRow}>
                  <TextInput
                    style={[
                      styles.chatInput,
                      isFocused && styles.chatInputFocused,
                    ]}
                    placeholder="your thoughts go here..."
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={chatMessage}
                    onChangeText={setChatMessage}
                    onSubmitEditing={onSendMessage}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    returnKeyType="send"
                    multiline
                    textAlignVertical="center"
                  />
                  <TouchableOpacity
                    style={[styles.sendButton, loading && styles.sendButtonDisabled]}
                    onPress={loading ? undefined : onSendMessage}
                    activeOpacity={loading ? 1 : 0.7}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={loading ? ['#666666', '#888888'] : ['#FF6B35', '#FF8A65']}
                      style={styles.sendButtonGradient}
                    >
                      {loading ? (
                        <Ionicons name="ellipsis-horizontal" size={18} color="#FFFFFF" />
                      ) : (
                        <Ionicons name="send" size={18} color="#FFFFFF" />
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </BlurView>
        </Animated.View>
      </Animated.View>
    );
  };

export const AppLayout: React.FC<AppLayoutProps> = ({ children, showChatbox = true }) => {
  const [chatMessage, setChatMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendMessage = async () => {
    if (chatMessage.trim() && !loading) {
      setLoading(true);
      try {
        const response = await fetch(ENDPOINTS.TRANSFORM_THOUGHT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            thought: chatMessage
          }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log('Goal and tasks created successfully:', data);
          setChatMessage('');

          // Show success message
          Alert.alert(
            'Success! 🎯',
            `Created goal "${data.createdGoal?.title}" with ${data.createdTasks?.length || 0} tasks!`,
            [
              {
                text: 'View in Reflect',
                onPress: () => router.push('/(tabs)/goals'),
                style: 'default'
              },
              {
                text: 'Stay Here',
                style: 'cancel'
              }
            ]
          );
        } else {
          console.error('Error creating goal and tasks:', data.error);
          Alert.alert('Error', data.error || 'Failed to process your thought. Please try again.');
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        Alert.alert('Error', 'Network error. Please check your connection and try again.');
      }
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent={true}
          animated={true}
        />

        {/* Main Content */}
        <View style={styles.content}>
          {children}
        </View>
        <KeyboardAvoidingWrapper
          style={styles.keyboardWrapper}
          innerStyle={styles.keyboardInner}
        >
          {/* Glass Chat Component - Only show if showChatbox is true */}
          {showChatbox && (
            <GlassChat
              chatMessage={chatMessage}
              setChatMessage={setChatMessage}
              onSendMessage={handleSendMessage}
              loading={loading}
            />
          )}
        </KeyboardAvoidingWrapper>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  keyboardInner: {
    padding: 0,
    justifyContent: 'flex-end',
  },
  content: {
    flex: 1,
  },
  chatContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 88 : 70, // Directly above tab bar
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: 'transparent',
  },
  chatBlur: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  blurViewStyle: {
    flex: 1,
  },
  chatOverlay: {
    backgroundColor: 'transparent',
    borderWidth: 0,

  },
  chatContent: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    position: 'relative',
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'transparent',

  },
  chatInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter',
    fontWeight: '400',
    paddingVertical: 10,
    paddingRight: 12,
    height: 40,
    overflowY: 'hidden',
    outlineWidth: 0,
    outlineColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  chatInputFocused: {
    fontSize: 17,
    fontWeight: '500',
    outlineWidth: 0,
    outlineColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  sendButton: {
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
});